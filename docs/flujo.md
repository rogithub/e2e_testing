# Flujo

Cómo una idea se vuelve una prueba de regresión que el dueño aprobó viendo su video. Basado en
`IAe2eQaTool` (Azure DevOps y un equipo de QA), adaptado a un solo desarrollador con GitHub.

## La meta

Cada caso se automatiza una vez, el dueño lo aprueba una vez, y desde entonces corre en cada
regresión. Cuando una corrida falla, el resultado dice en qué paso del caso falló y por qué, en
texto que se pega en un issue.

El tiempo del dueño es lo escaso. La IA prepara todo; el dueño ve el video y decide.

## Quién hace qué

| Etapa | El dueño | La IA | Dónde queda |
|---|---|---|---|
| 1. Funcionalidad | La platica en lenguaje natural | Pregunta lo que falte | El chat |
| 2. Historia | Dice "va" o qué cambiar | Escribe la historia | Issue de GitHub con etiquetas `historia` y `área:<área>` |
| 3. Casos | Aprueba la lista de casos y sus pasos | Los escribe | `historias/<área>/<issue>-<slug>/cp-<n>-<slug>/caso.md` |
| 4. Automatización | — | Recorre cada paso en la página real, escribe la prueba, la corre, **la rompe a propósito** y la vuelve a correr en verde, con video | `prueba.spec.ts`, `revision.json`, `corridas/` |
| 5. Revisión | Ve el video con sus pasos y tiempos; contesta **Sí**, **Cambia esto** o **Es un bug** | — | El tablero |
| 6. Firma | — | Copia la firma a `revision.json`; con "Cambia esto" aplica los cambios y publica otra versión | `revision.json`, un PR |
| 7. Regresión | Lee las fallas | Corre la suite y redacta el issue de cada falla | Issues |

Etapas 1 a 3 son conversación y no necesitan el tablero. La revisión (5) es por caso.

## La revisión

Todo viene lleno con lo que la IA vio en la página:

- **El video** de cada escenario y dispositivo, con la lista de pasos: cada paso tiene su `▶ 0:12`
  que abre el video en ese momento.
- **Las notas de la IA**: dónde la página no coincide con el caso ("el botón dice *Guardar
  producto*, el caso dice *Guardar*: recomiendo corregir el caso") y qué no alcanza a comprobar
  la prueba. Cada nota trae la respuesta recomendada; el dueño solo cambia la que no le parezca.
- **La prueba de que la prueba sirve**: qué rompió la IA a propósito y el error que dio.

| Respuesta | Qué sigue |
|---|---|
| **Sí** | El caso entra a la regresión. |
| **Cambia esto** (con un comentario) | La IA aplica el cambio, vuelve a correr y publica otra versión; solo lo que cambió necesita otra mirada. |
| **Es un bug** | La prueba está bien y la aplicación mal: se abre un issue de bug y la prueba se marca con `test.fail` (`docs/convenciones.md`). |

## Qué se guarda dónde

Nada de lo necesario para correr o mantener las pruebas depende de la IA ni del tablero: una vez
aprobadas, son Playwright normal y corren con `npx playwright test` en cualquier máquina o en CI.

| Qué | Dónde | Si se borra el tablero |
|---|---|---|
| Historia | Issue de GitHub | No se pierde |
| Caso | `caso.md` en el proyecto | No se pierde |
| Prueba | `prueba.spec.ts` en el proyecto | No se pierde |
| Revisión, firmas, resultado | `revision.json` en el proyecto, copiado del tablero al firmar | No se pierde, una vez copiado |
| Corridas: `.txt`, `.json`, video | `corridas/` en la máquina que corrió (no se versiona) | Se recrean corriendo otra vez |
| Traces | `corridas/` y `test-results/`, solo en la máquina: guardan contraseñas | — |

Una historia se cierra (su issue) cuando todos sus casos están firmados.

## Ramas

Un PR por historia hacia `main`, con sus casos, pruebas y revisiones. El CI del proyecto corre la
regresión en cada PR. La IA no hace commit ni push sin que el dueño lo pida.
