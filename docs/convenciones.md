# Convenciones de las pruebas

Cómo se escriben las pruebas E2E en cada proyecto. Léelo antes de escribir o cambiar una.

## Carpetas de un proyecto

```
<proyecto>/e2e/
  playwright.config.ts
  tests/auth.setup.ts                entra una vez con el usuario de pruebas y guarda la sesión
  paginas/<Nombre>Pagina.ts          Page Objects: localizadores e interacciones
  acciones/<area>.ts                 operaciones del negocio y todas las aserciones
  historias/
    <area>/                          productos, ventas, compras…
      <issue>-<slug>/                una historia de usuario = un issue de GitHub (#12)
        cp-<n>-<slug>/               un caso de prueba
          caso.md                    los pasos numerados (docs/formatos.md)
          prueba.spec.ts             los escenarios del caso
          revision.json              lo que la IA vio, las decisiones y la firma
  corridas/                          no se versiona: el reporter escribe aquí
```

La jerarquía área → historia → caso es la misma en las carpetas, en los issues y en el tablero.
Los nombres de carpeta van en minúsculas, sin acentos ni espacios: `12-alta-de-productos`.

## Capas

| Capa | Dónde | Hace | No hace |
|---|---|---|---|
| Prueba | `historias/…/prueba.spec.ts` | Un `test()` por escenario; cada interacción y aserción dentro de `paso('<n>', …)` | Localizar elementos o afirmar directamente: llama a acciones |
| Acciones | `acciones/<area>.ts` | Una función por operación del negocio (`agregarProducto`, `verificarAviso`); **todas** las aserciones, con `expect` de Playwright | Guardar selectores sueltos |
| Páginas | `paginas/<Nombre>Pagina.ts` | Localizadores e interacciones (abrir, llenar, presionar); recibe `page` en el constructor | Aserciones: una página nunca llama a `expect` |

Una prueba de un caso se ve así:

```ts
import { nombreE2E, paso, test } from '@ro/e2e';
import { abrirAlta, agregarProducto, verificarAvisoDeAlta } from '../../../../acciones/productos';

test('agregar un producto muestra su NID', async ({ page }, testInfo) => {
  const nombre = nombreE2E(testInfo.project.name);
  await paso('1', () => abrirAlta(page));
  await paso('2-3', () => agregarProducto(page, nombre, 'PAPELERÍA'));
  await paso('4', () => verificarAvisoDeAlta(page, nombre));
});
```

- `paso('3', …)`, `paso('2-3', …)` o `paso('2, 4', …)` usa los números de `caso.md`. Un número que
  el caso no tiene hace fallar la prueba: el caso cambió y hay que renumerar.
- Cada paso del caso está en exactamente un `paso()` de algún escenario.
- Se importa `test` de `@ro/e2e`, no de `@playwright/test`: marca cuándo empieza el video, y así el
  reporte sabe en qué segundo empieza cada paso.
- Lo que falla fuera de todo `paso()` se reporta como "fuera de los pasos": evítalo.

## Playwright

- Localizadores por rol, etiqueta o texto (`getByRole`, `getByLabel`); CSS o id solo si la página
  no da nada mejor. **El selector sale de la página real** (Playwright MCP), nunca del código de la
  aplicación ni de una página parecida.
- Aserciones web-first (`await expect(locator).toHaveText(…)`), que reintentan; nunca leer el DOM
  una vez y comparar.
- `await` en todo.
- **Nunca debilitar una aserción**: ni comparación parcial donde el paso dice un valor exacto, ni
  ignorar mayúsculas, ni subir un timeout para que pase.

## Datos de prueba

- La base de desarrollo se comparte entre corridas y dispositivos. Cada dato que una prueba crea
  lleva `nombreE2E(testInfo.project.name)` («E2E escritorio-firefox 1759950000000»): no choca con
  otro y se reconoce para limpiarlo.
- Nunca contra producción.

## Un bug conocido de la aplicación

Cuando la revisión concluye "la aplicación está mal", la prueba sigue afirmando lo que dice el caso
y se marca así:

```ts
test('…', async ({ page }) => {
  test.fail(true, 'Bug #45: el aviso no muestra el NID');
  …
});
```

La regresión sigue verde mientras el bug exista. Cuando lo arreglan, la prueba "pasa sin esperarlo"
y Playwright la reporta como falla: es la señal para quitar el `test.fail` y cerrar el issue.

## Evidencia y secretos

- `use: { ...evidencia() }` en el config: con `E2E_EVIDENCIA=1` graba video y trace de cada prueba
  con 400 ms entre acciones, para que el video se pueda seguir.
- El reporter tacha en los reportes el valor de `E2E_PASS` (y de las variables que se le indiquen).
- Los traces guardan lo que se escribe, contraseñas incluidas: no salen de la máquina. Lo que se
  comparte es el video y el `.txt`.

## Estilo

- Español en nombres, textos y comentarios, como el resto de los proyectos.
- Nombres que se explican solos en vez de comentarios. Un comentario solo para lo que el código no
  puede decir: un comportamiento raro de la aplicación, o por qué se descartó lo obvio.
