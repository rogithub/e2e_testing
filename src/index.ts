import { test as base, devices, expect } from '@playwright/test';
import { ANOTACION_INICIO_VIDEO } from './formato.ts';

export { expect };
export { paso } from './paso.ts';
export { leerCaso, expandirPasos, casoDelSpec, type Caso, type PasoDelCaso } from './caso.ts';

// Marca cuándo empezó el video: se graba desde que se crea el contexto del navegador, que puede
// ser segundos después de que empieza la prueba.
export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    testInfo.annotations.push({ type: ANOTACION_INICIO_VIDEO, description: String(Date.now()) });
    await use(page);
  },
});

/** Pausa entre acciones al grabar evidencia, para que el video se pueda seguir a simple vista. */
export const PAUSA_EVIDENCIA_MS = 400;

/**
 * Opciones de `use` para grabar evidencia (video y trace de cada prueba, acciones más lentas).
 * Se activa con E2E_EVIDENCIA=1. Los traces guardan lo que se escribe, contraseñas incluidas:
 * nunca salen de la máquina que los grabó.
 */
export function evidencia(activa = process.env.E2E_EVIDENCIA === '1') {
  if (!activa) return {};
  return {
    video: 'on',
    trace: 'on',
    launchOptions: { slowMo: PAUSA_EVIDENCIA_MS },
  } as const;
}

/** Los dispositivos donde se usan los sistemas: la caja con monitor y el iPad mini. */
export const dispositivos = {
  'escritorio-firefox': {
    ...devices['Desktop Firefox'],
    viewport: { width: 1920, height: 1080 },
  },
  // Emulado con Chromium: WebKit en Linux ARM no es el Safari real; lo que importa es el ancho.
  'ipad-mini': {
    ...devices['Desktop Chrome'],
    viewport: { width: 744, height: 1133 },
    deviceScaleFactor: 2,
    hasTouch: true,
  },
};

// La base de desarrollo se comparte entre corridas y dispositivos: cada dato de prueba lleva un
// sello que no existe todavía, y el prefijo E2E permite reconocerlo y limpiarlo.

/** «<dispositivo> <milisegundos>». */
export const sello = (dispositivo: string) => `${dispositivo} ${Date.now()}`;

/** «E2E <dispositivo> <milisegundos>». */
export const nombreE2E = (dispositivo: string) => `E2E ${sello(dispositivo)}`;
