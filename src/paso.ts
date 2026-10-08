import { test } from '@playwright/test';
import { ARCHIVO_CASO, casoDelSpec, expandirPasos } from './caso.ts';

/**
 * Corre `accion` como los pasos `ids` del caso.md que está junto al spec. Toda interacción y toda
 * aserción de una prueba de caso va dentro de un paso: así el resultado dice "falló en el paso 3".
 */
export async function paso<T>(ids: string, accion: () => Promise<T>): Promise<T> {
  const archivo = test.info().file;
  const caso = casoDelSpec(archivo);
  if (!caso) throw new Error(`No hay ${ARCHIVO_CASO} junto a ${archivo}: paso() solo se usa en pruebas de un caso.`);

  const numeros = expandirPasos(ids);
  const faltan = numeros.filter((n) => !caso.pasos.has(n));
  if (faltan.length > 0) {
    throw new Error(`${ARCHIVO_CASO} no tiene el paso ${faltan.join(', ')}. ¿Cambió el caso? Renumera los paso() de la prueba.`);
  }

  const texto = numeros.map((n) => caso.pasos.get(n)!.texto).join(' / ');
  return test.step(`Paso ${ids}: ${texto}`, accion, { box: true });
}
