import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import type { FullConfig, Reporter, Suite, TestCase, TestResult, TestStep } from '@playwright/test/reporter';
import { casoDelSpec } from './caso.ts';
import {
  ANOTACION_INICIO_VIDEO,
  type EscenarioCorrido,
  FUERA_DE_LOS_PASOS,
  fechaLegible,
  idCorrida,
  limpiarError,
  nombreArchivo,
  type PasoCorrido,
  PREFIJO_PASO,
  type Resultado,
  textoEscenario,
  textoResumen,
} from './formato.ts';

export interface OpcionesReporter {
  /** El nombre del sistema probado, como lo muestra el tablero: "ro_inventario". */
  proyecto: string;
  /** Dónde se escriben las corridas, relativo al playwright.config. Por omisión "corridas". */
  carpeta?: string;
  /** Variables de entorno cuyos valores nunca aparecen en un reporte. Por omisión E2E_PASS. */
  secretos?: string[];
}

interface Pendiente {
  escenario: EscenarioCorrido;
  archivo: string;
  videoOrigen?: string;
}

/**
 * Escribe cada escenario corrido en corridas/<id>/<carpeta del caso>/<escenario> [<dispositivo>]
 * como .txt (para leer y pegar en un issue), .json (para el tablero) y .webm (el video, si se
 * grabó), más un resumen.txt de la corrida. Formato en docs/formatos.md.
 */
export default class ReporterDePasos implements Reporter {
  private readonly opciones: Required<OpcionesReporter>;
  private raiz = process.cwd();
  private inicio = new Date();
  private id = '';
  private readonly pendientes: Pendiente[] = [];

  constructor(opciones: OpcionesReporter) {
    if (!opciones?.proyecto) throw new Error('El reporter de @ro/e2e necesita { proyecto: "<nombre>" }');
    this.opciones = { carpeta: 'corridas', secretos: ['E2E_PASS'], ...opciones };
  }

  printsToStdio() {
    return false;
  }

  onBegin(config: FullConfig, _suite: Suite) {
    this.raiz = config.configFile ? dirname(config.configFile) : config.rootDir;
    this.inicio = new Date();
    this.id = idCorrida(this.inicio);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const secretos = this.opciones.secretos.map((v) => process.env[v] ?? '').filter(Boolean);
    const limpiar = (m: string) => limpiarError(m, secretos);

    const caso = casoDelSpec(test.location.file);
    const carpetaCaso = caso ? relative(this.raiz, caso.carpeta).split(sep).join('/') : undefined;
    const dispositivo = test.parent.project()?.name ?? '';

    const inicioVideo = this.inicioVideo(test, result);
    const pasos = pasosDelCaso(result.steps).map(
      ({ ids, step }): PasoCorrido => ({
        ids,
        texto: step.title.replace(PREFIJO_PASO, ''),
        estado: step.error ? 'falla' : 'pasa',
        inicioSeg: redondear((step.startTime.getTime() - inicioVideo) / 1000),
        duracionSeg: redondear(step.duration / 1000),
        ...(step.error?.message ? { error: limpiar(step.error.message) } : {}),
      }),
    );

    const resultado = traducir(result.status);
    const pasoFallido =
      resultado === 'falla' && caso ? (pasos.find((p) => p.estado === 'falla')?.ids ?? FUERA_DE_LOS_PASOS) : undefined;
    const video = result.attachments.find((a) => a.name === 'video' && a.path)?.path;
    const nombre = nombreArchivo(test.title, dispositivo, result.retry);

    const escenario: EscenarioCorrido = {
      proyecto: this.opciones.proyecto,
      ...(caso && carpetaCaso ? { caso: { carpeta: carpetaCaso, titulo: caso.titulo } } : {}),
      escenario: test.title,
      dispositivo,
      corrida: { id: this.id, inicio: fechaLegible(result.startTime), duracionSeg: redondear(result.duration / 1000) },
      resultado,
      ...(pasoFallido ? { pasoFallido } : {}),
      pasos,
      ...(result.error?.message ? { error: limpiar(result.error.message) } : {}),
      ...(video ? { video: `${nombre}${extname(video)}` } : {}),
    };

    const carpeta = join(resolve(this.raiz, this.opciones.carpeta), this.id, carpetaCaso ?? 'sin-caso');
    this.pendientes.push({ escenario, archivo: join(carpeta, nombre), videoOrigen: video });
  }

  // Los videos se terminan de escribir al cerrar el contexto: se copian al final de la corrida.
  onEnd() {
    for (const { escenario, archivo, videoOrigen } of this.pendientes) {
      mkdirSync(dirname(archivo), { recursive: true });
      writeFileSync(`${archivo}.txt`, textoEscenario(escenario));
      writeFileSync(`${archivo}.json`, JSON.stringify(escenario, null, 2) + '\n');
      if (videoOrigen && existsSync(videoOrigen) && escenario.video) {
        copyFileSync(videoOrigen, join(dirname(archivo), basename(escenario.video)));
      }
    }
    if (this.pendientes.length === 0) return;
    const carpetaCorrida = join(resolve(this.raiz, this.opciones.carpeta), this.id);
    writeFileSync(join(carpetaCorrida, 'resumen.txt'), textoResumen(this.id, this.pendientes.map((p) => p.escenario)));
  }

  private inicioVideo(test: TestCase, result: TestResult): number {
    const anotaciones = [...(result.annotations ?? []), ...test.annotations];
    const marca = anotaciones.findLast((a) => a.type === ANOTACION_INICIO_VIDEO)?.description;
    return marca ? Number(marca) : result.startTime.getTime();
  }
}

function pasosDelCaso(steps: TestStep[]): { ids: string; step: TestStep }[] {
  return steps.flatMap((step) => {
    const ids = step.category === 'test.step' ? step.title.match(PREFIJO_PASO)?.[1].trim() : undefined;
    return ids ? [{ ids, step }] : pasosDelCaso(step.steps);
  });
}

function traducir(status: TestResult['status']): Resultado {
  switch (status) {
    case 'passed': return 'pasa';
    case 'skipped': return 'omitida';
    case 'interrupted': return 'interrumpida';
    default: return 'falla';
  }
}

const redondear = (n: number) => Math.round(n * 10) / 10;
