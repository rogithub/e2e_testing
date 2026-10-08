# Formatos

## caso.md

Un caso de prueba, escrito por la IA y aprobado por el dueño. Plantilla en
[`../plantillas/caso.md`](../plantillas/caso.md).

```markdown
# CP-1 · Alta básica de un producto

- Historia: #12 Alta de productos
- Área: productos

## Antes de empezar
- Sesión iniciada con el usuario de pruebas.
- Existe al menos una categoría.

## Pasos
1. Abro **Productos** y presiono **Nuevo producto**.
   Espero: el título «Nuevo producto» y el cursor en Nombre.
2. Escribo un nombre que no existe y elijo una categoría.
3. Presiono **Guardar producto**.
   Espero: un aviso con el nombre y su NID, y el formulario vacío.
```

- El título (`# `) empieza con `CP-<n> · `.
- Solo cuenta como paso una línea `<n>. ` dentro de `## Pasos`. Se numeran 1, 2, 3… sin huecos ni
  subpasos.
- `Espero:` (con sangría) es lo que el paso comprueba. Las líneas con sangría que siguen continúan
  el texto o lo esperado.
- Las marcas de Markdown (`**…**`, `*…*`) se quitan al mostrar el paso en un reporte.
- Si un paso cambia de número, las pruebas que lo citan fallan hasta que se renumeren. Al cambiar
  un caso, la IA empareja los pasos viejos con los nuevos **por su texto, no por su número**.

## corridas/

El reporter (`@ro/e2e/reporter`) escribe cada escenario corrido en:

```
corridas/<id>/                           <id> = fecha y hora local: 20261008-153012
  resumen.txt                            una línea por escenario: PASA, FALLA en el paso 3…
  <carpeta del caso>/                    historias/productos/12-alta-de-productos/cp-1-alta-basica
    <escenario> [<dispositivo>].txt      para leer y pegar en un issue
    <escenario> [<dispositivo>].json     lo mismo, para el tablero
    <escenario> [<dispositivo>].webm     el video, con E2E_EVIDENCIA=1
  sin-caso/                              pruebas que no son de un caso (las viejas, el health)
```

El `.txt`:

```
Proyecto:    ro_inventario
Caso:        CP-1 · Alta básica de un producto
             historias/productos/12-alta-de-productos/cp-1-alta-basica
Escenario:   agregar un producto muestra su NID
Dispositivo: escritorio-firefox
Corrida:     20261008-153012, 2026-10-08 15:30:12, 8.7 s
Resultado:   FALLA en el paso 3

PASA    0:01  1     Abro Productos y presiono Nuevo producto.
PASA    0:03  2     Escribo un nombre que no existe y elijo una categoría.
FALLA   0:05  3     Presiono Guardar producto.
                    Error: expect(locator).toHaveText(expected) failed
                    …
```

La columna de tiempo es el segundo del video en que empieza el paso. El `.json` tiene los mismos
datos (`EscenarioCorrido` en `src/formato.ts`).

## revision.json

> Borrador: se cierra al construir el tablero (`pendientes/index.md`).

El registro durable de lo que se acordó en la revisión de un caso. La IA lo escribe al publicar una
revisión y otra vez cuando el dueño firma, copiando sus respuestas del tablero.

| Campo | Contiene |
|---|---|
| `caso` | Carpeta y título del caso |
| `version` | Versión de la revisión: 1, 2… (una más por cada "Cambia esto") |
| `notas` | Cada diferencia entre el caso y la página, o cosa que la prueba no comprueba: `paso`, `vi` (lo que mostró la página), `recomiendo`, `cambio` (si es nueva en esta versión) |
| `rotaAPropósito` | Qué se rompió, en qué paso falló y con qué mensaje |
| `corrida` | Id de la corrida revisada y sus escenarios (los `.json` de `corridas/`) |
| `firmas` | Una por versión: `respuesta` (`si`, `cambios`, `bug`), comentario, fecha |
| `resultado` | `verificado` o `bug` (con el número del issue), cuando la última versión está firmada |
