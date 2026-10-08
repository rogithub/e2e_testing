# e2e_testing

Pruebas de punta a punta (E2E) para mis proyectos, escritas por IA y aprobadas por mí viendo el
video de cada prueba. Idea tomada de IAe2eQaTool, para un solo desarrollador, con GitHub y
Playwright en TypeScript.

## Cómo funciona

1. Platico con la IA una funcionalidad. Ella escribe la **historia de usuario** como issue.
2. De la historia saca los **casos de prueba** (`caso.md`, pasos numerados) y yo los apruebo.
3. La IA recorre los pasos en la aplicación real, escribe la prueba, la rompe a propósito para
   demostrar que detecta fallas y la graba en video.
4. En el tablero veo el video con cada paso marcado en el tiempo, y contesto: **Sí**, **Cambia
   esto** o **Es un bug**.
5. Lo aprobado corre en cada regresión. Si algo falla, el reporte dice en qué paso y por qué.

Detalle en [`docs/flujo.md`](docs/flujo.md). Lo que falta decidir o construir:
[`docs/pendientes/index.md`](docs/pendientes/index.md).

## Qué hay en este repo

Lo que comparten todos los proyectos. Las historias, casos y pruebas de cada proyecto viven en su
propio repo, en `e2e/` ([`docs/convenciones.md`](docs/convenciones.md)).

- `@ro/e2e`: `test`, `paso()`, `evidencia()`, `dispositivos`, `nombreE2E()` y el reporter por paso.
- Reglas para la IA ([`CLAUDE.md`](CLAUDE.md)), convenciones, formatos y plantillas.
- [`ejemplo/`](ejemplo/): un caso completo que sirve de muestra y de prueba del kit.

## Usarlo en un proyecto

```jsonc
// e2e/package.json
"devDependencies": {
  "@playwright/test": "1.63.0",
  "@ro/e2e": "github:rogithub/e2e_testing#v0.1.0"
}
```

```ts
// e2e/playwright.config.ts
import { dispositivos, evidencia } from '@ro/e2e';

export default defineConfig({
  reporter: [['list'], ['@ro/e2e/reporter', { proyecto: 'ro_inventario' }]],
  use: { baseURL, ...evidencia() },
  projects: [
    { name: 'escritorio-firefox', use: { ...dispositivos['escritorio-firefox'], storageState } },
    { name: 'ipad-mini', use: { ...dispositivos['ipad-mini'], storageState } },
  ],
});
```

`E2E_EVIDENCIA=1 npx playwright test` graba los videos; los resultados quedan en `e2e/corridas/`.

## Desarrollo

```bash
npm install          # también compila dist/
npm test             # pruebas unitarias
npm run typecheck
E2E_EVIDENCIA=1 npm run ejemplo
```

## Licencia

GPL v3 o posterior ([`LICENSE`](LICENSE)), igual que `inventario_papeleria`.
