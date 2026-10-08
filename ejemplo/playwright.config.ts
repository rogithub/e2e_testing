import { defineConfig } from '@playwright/test';
import { dispositivos, evidencia } from '../src/index.ts';

// Ejemplo y prueba del kit: un caso contra una página en memoria, sin servidor. Con
// E2E_EVIDENCIA=1 graba video; con E2E_ROMPER=1 una aserción espera otra cosa y falla a propósito.
export default defineConfig({
  testDir: './historias',
  reporter: [['list'], ['../src/reporter.ts', { proyecto: 'ejemplo' }]],
  use: { ...evidencia() },
  projects: [
    { name: 'escritorio-firefox', use: dispositivos['escritorio-firefox'] },
    { name: 'ipad-mini', use: dispositivos['ipad-mini'] },
  ],
});
