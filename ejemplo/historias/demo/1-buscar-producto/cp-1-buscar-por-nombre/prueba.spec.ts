import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, paso, test } from '../../../../../src/index.ts';

const pagina = readFileSync(join(import.meta.dirname, 'pagina.html'), 'utf8');
const esperado = process.env.E2E_ROMPER === '1' ? '2 de 3' : '1 de 3';

test('buscar «pluma» deja solo la pluma', async ({ page }) => {
  const filas = page.getByRole('row').filter({ has: page.getByRole('cell') });

  await paso('1', async () => {
    await page.setContent(pagina);
    await expect(filas).toHaveCount(3);
  });
  await paso('2', () => page.getByLabel('Buscar').fill('pluma'));
  await paso('3', async () => {
    await expect(filas.filter({ visible: true }).locator('td:first-child')).toHaveText(['PLUMA AZUL']);
    await expect(page.getByRole('status')).toHaveText(esperado);
  });
});
