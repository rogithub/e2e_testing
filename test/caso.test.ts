import assert from 'node:assert/strict';
import { test } from 'node:test';
import { expandirPasos, leerCaso } from '../src/caso.ts';

const CASO = `# CP-1 · Alta básica de un producto

- Historia: #12 Alta de productos

## Antes de empezar
1. Esto no es un paso.

## Pasos
1. Abro **Productos** y presiono **Nuevo producto**.
   Espero: el título «Nuevo producto»
   y el cursor en *Nombre*.
2. Escribo un nombre que no existe
   y elijo una categoría.
3. Presiono **Guardar producto**.
   Espero: un aviso con el NID.

## Notas
4. Tampoco es un paso.
`;

test('lee el título y solo los pasos de la sección Pasos', () => {
  const caso = leerCaso(CASO);
  assert.equal(caso.titulo, 'CP-1 · Alta básica de un producto');
  assert.deepEqual([...caso.pasos.keys()], [1, 2, 3]);
});

test('une las líneas de continuación al texto o a lo esperado', () => {
  const caso = leerCaso(CASO);
  assert.equal(caso.pasos.get(1)?.esperado, 'el título «Nuevo producto» y el cursor en Nombre.');
  assert.equal(caso.pasos.get(2)?.texto, 'Escribo un nombre que no existe y elijo una categoría.');
  assert.equal(caso.pasos.get(2)?.esperado, undefined);
});

test('quita las marcas de Markdown del texto de los pasos', () => {
  assert.equal(leerCaso(CASO).pasos.get(1)?.texto, 'Abro Productos y presiono Nuevo producto.');
});

test('un paso repetido es un error', () => {
  assert.throws(() => leerCaso('## Pasos\n1. a\n1. b\n'), /repite el paso 1/);
});

test('expande números, rangos y listas', () => {
  assert.deepEqual(expandirPasos('3'), [3]);
  assert.deepEqual(expandirPasos('1-3'), [1, 2, 3]);
  assert.deepEqual(expandirPasos('2, 4-5'), [2, 4, 5]);
  assert.throws(() => expandirPasos('3-1'), /al revés/);
  assert.throws(() => expandirPasos('3.1'), /mal escritos/);
});
