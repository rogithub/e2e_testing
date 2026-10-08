# e2e_testing

Kit compartido para pruebas E2E escritas por IA y aprobadas por una persona viendo el video. Cada
proyecto guarda sus historias, casos y pruebas junto a su código (`<proyecto>/e2e/`); aquí vive solo
lo que comparten: el paquete `@ro/e2e` (`src/`), las reglas, los formatos y las plantillas.

El dueño es un solo desarrollador. Háblale en español, claro y corto. Las decisiones de qué se
prueba y la firma de una revisión son suyas.

## Empieza aquí

| Para | Lee |
|---|---|
| El proceso: historia → casos → prueba → revisión → firma | [`docs/flujo.md`](docs/flujo.md) |
| Escribir o cambiar una prueba en un proyecto | [`docs/convenciones.md`](docs/convenciones.md) |
| `caso.md`, `revision.json`, `corridas/` | [`docs/formatos.md`](docs/formatos.md) |
| Decisiones abiertas | [`docs/pendientes/index.md`](docs/pendientes/index.md): léelo antes de proponer un cambio; agrega ahí lo que encuentres y no te pidieron arreglar |

## Estructura

```
src/            el paquete @ro/e2e: test (con marca de video), paso(), evidencia(), dispositivos,
                sello(), y el reporter (src/reporter.ts) que escribe corridas/
test/           pruebas unitarias del paquete (node --test)
ejemplo/        un caso completo contra una página en memoria: ejemplo y prueba del kit
plantillas/     caso.md
docs/           proceso, convenciones, formatos, pendientes
```

## Comandos

| Comando | Para |
|---|---|
| `npm test` | Pruebas unitarias |
| `npm run typecheck` | Tipos de todo, ejemplo incluido |
| `npm run build` | Compila `dist/` (también corre al instalar el paquete desde git) |
| `E2E_EVIDENCIA=1 npm run ejemplo` | El ejemplo con video; resultados en `ejemplo/corridas/` |
| `E2E_ROMPER=1 npm run ejemplo` | El ejemplo fallando a propósito en el paso 3 |

## Documentación

Cada texto tiene un lector: reglas para la IA (este archivo, `docs/convenciones.md`), proceso para
el dueño (`README.md`, `docs/flujo.md`), decisiones abiertas (`docs/pendientes/`). Cada hecho se
escribe en un solo lugar y en los demás se enlaza. Este repo es genérico: lo propio de un proyecto
va en ese proyecto.

## Nunca

- Debilitar una aserción o borrar un escenario para que una prueba pase. Un bug real de la
  aplicación se registra (`test.fail`, ver convenciones) y se reporta como issue, nunca se esconde.
- Escribir una prueba de un paso que no viste en la página real, ni un selector deducido del código.
- Publicar una revisión sin una corrida que falló a propósito en el paso que se rompió.
- Firmar una revisión: la firma es del dueño.
- Escribir, leer o imprimir una contraseña. Las credenciales llegan por variables de entorno
  (`E2E_USER`, `E2E_PASS`) y la sesión la guarda el `auth.setup.ts` del proyecto.
- Subir un trace a ningún lado: guarda lo que se escribió, contraseñas incluidas.
- Correr pruebas contra producción.
- Hacer commit o push sin que te lo pidan.
