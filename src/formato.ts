// Lo que el reporter escribe de cada escenario corrido: el .json (lo lee el tablero) y el .txt (se
// lee como persona y se pega en un issue). Funciones puras, sin Playwright, para probarlas solas.

export type Resultado = 'pasa' | 'falla' | 'omitida' | 'interrumpida';

export interface PasoCorrido {
  ids: string;
  texto: string;
  estado: 'pasa' | 'falla';
  /** Segundo del video en que empieza el paso. */
  inicioSeg: number;
  duracionSeg: number;
  error?: string;
}

export interface EscenarioCorrido {
  proyecto: string;
  /** Carpeta del caso relativa a la raíz de las pruebas; ausente si la prueba no es de un caso. */
  caso?: { carpeta: string; titulo: string };
  escenario: string;
  dispositivo: string;
  corrida: { id: string; inicio: string; duracionSeg: number };
  resultado: Resultado;
  /** El paso donde falló, o "fuera de los pasos" si falló en código que no está en ningún paso(). */
  pasoFallido?: string;
  pasos: PasoCorrido[];
  error?: string;
  video?: string;
}

// El título de cada paso empieza con "Paso <ids>: " (lo pone paso()). Así el reporter sabe en qué
// paso del caso falló una prueba y en qué segundo del video empieza cada paso.
export const PREFIJO_PASO = /^Paso ([0-9][0-9,\s-]*):\s/;

// El fixture `page` de index.ts anota cuándo empezó el video (milisegundos desde 1970).
export const ANOTACION_INICIO_VIDEO = 'inicio-video';

export const FUERA_DE_LOS_PASOS = 'fuera de los pasos';

const ANSI = /\u001b\[[0-9;]*m/g;

export function limpiarError(mensaje: string, secretos: string[]): string {
  let limpio = mensaje.replace(ANSI, '').trimEnd();
  for (const secreto of secretos) {
    if (secreto.length >= 4) limpio = limpio.split(secreto).join('••••••');
  }
  return limpio;
}

/** 75.4 → "1:15". */
export function minutos(segundos: number): string {
  const s = Math.max(0, Math.floor(segundos));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Fecha en hora local: "20261008-153012" para el id, "2026-10-08 15:30:12" para leer. */
export function idCorrida(fecha: Date): string {
  return fechaLegible(fecha).replace(/[-:]/g, '').replace(' ', '-');
}

export function fechaLegible(fecha: Date): string {
  const d = (n: number) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${d(fecha.getMonth() + 1)}-${d(fecha.getDate())} ${d(fecha.getHours())}:${d(fecha.getMinutes())}:${d(fecha.getSeconds())}`;
}

/** Un nombre de archivo seguro: «<escenario> [<dispositivo>]». */
export function nombreArchivo(escenario: string, dispositivo: string, reintento = 0): string {
  const base = escenario.replace(/[\\/:*?"<>|\n\r\t]/g, '_').slice(0, 120).trim();
  const extra = reintento > 0 ? ` (reintento ${reintento})` : '';
  return `${base} [${dispositivo}]${extra}`;
}

const ETIQUETA: Record<PasoCorrido['estado'], string> = { pasa: 'PASA ', falla: 'FALLA' };

function lineaResultado(e: EscenarioCorrido): string {
  switch (e.resultado) {
    case 'pasa': return 'PASA';
    case 'omitida': return 'OMITIDA';
    case 'interrumpida': return 'INTERRUMPIDA';
    case 'falla':
      if (!e.pasoFallido) return 'FALLA';
      return e.pasoFallido === FUERA_DE_LOS_PASOS ? `FALLA ${FUERA_DE_LOS_PASOS}` : `FALLA en el paso ${e.pasoFallido}`;
  }
}

function sangrar(texto: string, espacios: number): string {
  const margen = ' '.repeat(espacios);
  return texto.split('\n').map((l) => margen + l).join('\n');
}

export function textoEscenario(e: EscenarioCorrido): string {
  const encabezado = [
    `Proyecto:    ${e.proyecto}`,
    ...(e.caso ? [`Caso:        ${e.caso.titulo}`, `             ${e.caso.carpeta}`] : []),
    `Escenario:   ${e.escenario}`,
    `Dispositivo: ${e.dispositivo}`,
    `Corrida:     ${e.corrida.id}, ${e.corrida.inicio}, ${e.corrida.duracionSeg.toFixed(1)} s`,
    `Resultado:   ${lineaResultado(e)}`,
  ];

  const ancho = Math.max(4, ...e.pasos.map((p) => p.ids.length));
  const pasos = e.pasos.flatMap((p) => {
    const linea = `${ETIQUETA[p.estado]}  ${minutos(p.inicioSeg).padStart(5)}  ${p.ids.padEnd(ancho)}  ${p.texto}`;
    return p.error ? [linea, sangrar(p.error, 16 + ancho)] : [linea];
  });

  const errorSuelto = e.error && e.pasoFallido === FUERA_DE_LOS_PASOS ? ['', sangrar(e.error, 2)] : [];
  return [...encabezado, '', ...pasos, ...errorSuelto, ''].join('\n');
}

export function textoResumen(idCorrida: string, escenarios: EscenarioCorrido[]): string {
  const cuenta = (r: Resultado) => escenarios.filter((e) => e.resultado === r).length;
  const lineas = [
    `Corrida ${idCorrida}: ${escenarios.length} escenarios, ${cuenta('pasa')} pasan, ${cuenta('falla')} fallan, ${cuenta('omitida')} omitidos`,
    '',
  ];
  for (const e of escenarios) {
    const donde = e.caso ? `${e.caso.carpeta} · ` : '';
    lineas.push(`${lineaResultado(e).padEnd(22)} ${donde}${e.escenario} [${e.dispositivo}]`);
  }
  return lineas.join('\n') + '\n';
}
