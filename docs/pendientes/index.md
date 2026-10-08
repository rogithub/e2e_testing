# Pendientes

Decisiones abiertas, huecos conocidos y cosas por vigilar. Cuando algo se decide y se hace, se
anota la decisión en una línea y la fila pasa a **Hecho**. Un tema que necesite más de una línea
lleva su propio archivo en esta carpeta.

| Tema | Recomendación |
|---|---|
| Skills de la IA: `/historia`, `/casos`, `/caso-a-e2e`, `/regresion` | Paso 2: escribirlas aquí mientras se hace la primera historia de `ro_inventario`, y moverlas a un plugin de Claude Code cuando funcionen. |
| Instalar `@ro/e2e` desde git en un proyecto (`github:rogithub/e2e_testing#v0.1.0`) | Probarlo en `ro_inventario` en el paso 2: que `prepare` compile en la instalación y en CI. |
| El tablero: proyecto → área → historia → caso, video con pasos y tiempos, Sí / Cambia esto / Es un bug | Paso 3, cuando haya un caso real que mostrar. Adaptar el `review-board` de IAe2eQaTool. Cierra el formato de `revision.json`. |
| ¿El segundo del video de cada paso cae donde debe? | Se mide desde que se crea la página (`test` de `@ro/e2e`). Verificarlo a ojo con la primera prueba real, que tarda más que el ejemplo. |
| Pasar `ro_inventario/e2e` a páginas / acciones / historias | Paso 2, sin perder ninguna prueba actual: las que no son de un caso siguen en `tests/` y salen en `corridas/<id>/sin-caso/`. |
| Etiquetas e issue form de historia en cada repo | Paso 2: `historia`, `área:<área>`, `bug`; plantilla `.github/ISSUE_TEMPLATE/historia.yml`. |
| Tiempo y tokens por caso | Como `metrics.jsonl` de IAe2eQaTool, cuando haya varios casos y valga la pena medir. |
| Conectar `inventario_papeleria` | Paso 4. |

## Hecho

| Tema | Decisión |
|---|---|
| Lenguaje | Node + TypeScript con Playwright (2026-10-08): es lo que ya usan los dos proyectos, y Playwright y su MCP son nativos de Node. |
| Dónde viven las pruebas | Junto al código de cada proyecto; aquí solo lo compartido (2026-10-08). |
| Dónde viven historias y casos | Historias como issues de GitHub; casos como `caso.md` en el proyecto, junto a su prueba (2026-10-08). |
| Ramas | Un PR por historia hacia `main`, sin la rama `coverage` de IAe2eQaTool (2026-10-08). |
| Gherkin | No: la prueba cita los pasos numerados del propio caso, como IAe2eQaTool (2026-10-08). |
