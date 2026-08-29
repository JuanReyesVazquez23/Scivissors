# scivissors

Corta fragmentos de vídeo directamente en el navegador. Sin backend, sin subir vídeos a ningún servidor: todo el procesamiento ocurre en el dispositivo del usuario con FFmpeg.wasm.

## Estado actual (incremento 1 de la hoja de ruta)

Implementado:

- Proyecto base con Vite + React + TypeScript (modo estricto).
- Shell visual de la app (header, contenedor principal, footer) con la paleta blanco/gris.

Pendiente (próximos incrementos):

- Selección y carga de vídeo, con validación de tipo/tamaño y preview.
- Modo automático (segmentos de 60s + resto).
- Modo manual (el usuario define los cortes que quiera).
- Integración de FFmpeg.wasm (servicio dedicado, aislado de los componentes).
- Descarga de los fragmentos resultantes.

## Cómo ejecutarlo

```bash
npm install
npm run dev
```

Esto no se ha instalado ni ejecutado en el entorno donde se generó el código (sin acceso a red), así que verifica que `npm install` y `npm run dev` funcionen sin errores antes de seguir.

## Scripts

- `npm run dev` — servidor de desarrollo.
- `npm run build` — build de producción (`tsc -b && vite build`).
- `npm run preview` — sirve el build de producción localmente.
- `npm run typecheck` — solo comprobación de tipos.

## Despliegue

Pensado para Vercel como sitio estático (framework preset: Vite). No hace falta `vercel.json` todavía porque no usamos cabeceras especiales; se añadirá si en un futuro incremento usamos el núcleo multi-hilo de FFmpeg.wasm (requiere `Cross-Origin-Opener-Policy` / `Cross-Origin-Embedder-Policy`).
