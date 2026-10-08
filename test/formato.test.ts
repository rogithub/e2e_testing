import assert from 'node:assert/strict';
import { test } from 'node:test';
import { type EscenarioCorrido, idCorrida, limpiarError, minutos, nombreArchivo, textoEscenario } from '../src/formato.ts';

test('minutos', () => {
  assert.equal(minutos(0), '0:00');
  assert.equal(minutos(75.9), '1:15');
  assert.equal(minutos(-2), '0:00');
});

test('el id de la corrida es la fecha local sin separadores', () => {
  assert.equal(idCorrida(new Date(2026, 9, 8, 15, 3, 7)), '20261008-150307');
});

test('los secretos y los colores de terminal no llegan al reporte', () => {
  assert.equal(limpiarError('\u001b[31mclave: s3cr3ta\u001b[39m', ['s3cr3ta']), 'clave: ••••••');
  assert.equal(limpiarError('a b', ['b']), 'a b', 'un secreto de menos de 4 letras no se tacha');
});

test('el nombre de archivo no lleva caracteres prohibidos', () => {
  assert.equal(nombreArchivo('a/b: c?', 'ipad-mini'), 'a_b_ c_ [ipad-mini]');
  assert.equal(nombreArchivo('x', 'ipad-mini', 1), 'x [ipad-mini] (reintento 1)');
});

test('el texto dice en qué paso falló, con su tiempo en el video y el error sangrado', () => {
  const e: EscenarioCorrido = {
    proyecto: 'ro_inventario',
    caso: { carpeta: 'historias/productos/12-alta/cp-1-alta-basica', titulo: 'CP-1 · Alta básica' },
    escenario: 'agrega un producto',
    dispositivo: 'escritorio-firefox',
    corrida: { id: '20261008-150307', inicio: '2026-10-08 15:03:07', duracionSeg: 8.73 },
    resultado: 'falla',
    pasoFallido: '3',
    pasos: [
      { ids: '1-2', texto: 'Abro Productos', estado: 'pasa', inicioSeg: 1.2, duracionSeg: 2 },
      { ids: '3', texto: 'Guardo', estado: 'falla', inicioSeg: 65, duracionSeg: 5, error: 'Esperaba «NID»\nRecibí «Error»' },
    ],
  };
  assert.equal(
    textoEscenario(e),
    [
      'Proyecto:    ro_inventario',
      'Caso:        CP-1 · Alta básica',
      '             historias/productos/12-alta/cp-1-alta-basica',
      'Escenario:   agrega un producto',
      'Dispositivo: escritorio-firefox',
      'Corrida:     20261008-150307, 2026-10-08 15:03:07, 8.7 s',
      'Resultado:   FALLA en el paso 3',
      '',
      'PASA    0:01  1-2   Abro Productos',
      'FALLA   1:05  3     Guardo',
      '                    Esperaba «NID»',
      '                    Recibí «Error»',
      '',
    ].join('\n'),
  );
});
