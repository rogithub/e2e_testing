import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

// Un caso de prueba es un `caso.md` (formato en docs/formatos.md) en la misma carpeta que su
// `prueba.spec.ts`. Las pruebas citan sus pasos por número: paso('3', …).

export const ARCHIVO_CASO = 'caso.md';

export interface PasoDelCaso {
  numero: number;
  texto: string;
  esperado?: string;
}

export interface Caso {
  carpeta: string;
  titulo: string;
  pasos: Map<number, PasoDelCaso>;
}

export function leerCaso(markdown: string, carpeta = ''): Caso {
  const lineas = markdown.split(/\r?\n/);
  const titulo = lineas.find((l) => l.startsWith('# '))?.slice(2).trim() ?? '';
  const pasos = new Map<number, PasoDelCaso>();

  const inicio = lineas.findIndex((l) => /^##\s+Pasos\s*$/.test(l));
  if (inicio === -1) return { carpeta, titulo, pasos };

  let actual: PasoDelCaso | undefined;
  for (const linea of lineas.slice(inicio + 1)) {
    if (/^#{1,2}\s/.test(linea)) break;
    const nuevo = linea.match(/^(\d+)\.\s+(.+)$/);
    if (nuevo) {
      const numero = Number(nuevo[1]);
      if (pasos.has(numero)) throw new Error(`${ARCHIVO_CASO} repite el paso ${numero}`);
      actual = { numero, texto: nuevo[2].trim() };
      pasos.set(numero, actual);
      continue;
    }
    if (!actual || !/^\s+\S/.test(linea)) continue;
    const esperado = linea.match(/^\s+Espero:\s*(.+)$/);
    if (esperado) actual.esperado = esperado[1].trim();
    else if (actual.esperado) actual.esperado += ` ${linea.trim()}`;
    else actual.texto += ` ${linea.trim()}`;
  }
  for (const p of pasos.values()) {
    p.texto = sinMarcas(p.texto);
    if (p.esperado) p.esperado = sinMarcas(p.esperado);
  }
  return { carpeta, titulo, pasos };
}

/** "3" → [3]; "1-3" → [1, 2, 3]; "2, 4-5" → [2, 4, 5]. */
export function expandirPasos(ids: string): number[] {
  const numeros: number[] = [];
  for (const parte of ids.split(',').map((p) => p.trim())) {
    const rango = parte.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rango) {
      const [desde, hasta] = [Number(rango[1]), Number(rango[2])];
      if (hasta < desde) throw new Error(`Rango de pasos al revés: "${parte}"`);
      for (let n = desde; n <= hasta; n++) numeros.push(n);
    } else if (/^\d+$/.test(parte)) {
      numeros.push(Number(parte));
    } else {
      throw new Error(`Pasos mal escritos: "${ids}". Se escriben "3", "1-3" o "2, 4-5".`);
    }
  }
  return numeros;
}

/** Quita las marcas de Markdown (**negritas**, *cursivas*) para mostrar el texto en reportes. */
export const sinMarcas = (texto: string) => texto.replace(/(\*\*|\*)(.+?)\1/g, '$2');

const cache = new Map<string, Caso | undefined>();

/** El caso de la carpeta de un spec, o undefined si el spec no está junto a un caso.md. */
export function casoDelSpec(archivoSpec: string): Caso | undefined {
  const carpeta = dirname(archivoSpec);
  if (!cache.has(carpeta)) {
    const ruta = join(carpeta, ARCHIVO_CASO);
    cache.set(carpeta, existsSync(ruta) ? leerCaso(readFileSync(ruta, 'utf8'), carpeta) : undefined);
  }
  return cache.get(carpeta);
}
