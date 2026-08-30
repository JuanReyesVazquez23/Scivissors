# scivissors

Corta fragmentos de vídeo directamente en el navegador. Sin backend, sin subir vídeos a ningún servidor: todo el procesamiento ocurre en el dispositivo del usuario con FFmpeg.wasm.

## Estado actual (incremento 4 de la hoja de ruta)

Implementado, además de lo anterior:

- `VideoSegment` — tipo compartido para un fragmento (`id`, `startTime`, `endTime`),
  pensado para que el modo automático y el manual usen la misma estructura.
- `generateAutoSegments()` — genera la lista real de segmentos para el modo
  automático (ya no es solo una vista previa: son los tiempos exactos que se
  usarán para cortar). La vista previa del incremento 3 ahora se deriva de esta
  función, en vez de duplicar el cálculo.
- `SegmentList` — muestra los fragmentos generados cuando el modo automático
  está activo.

Pendiente (próximos incrementos):

- Editor de cortes manuales (el usuario define tantos fragmentos como quiera,
  reutilizando el mismo tipo `VideoSegment`).
- Integración de FFmpeg.wasm (servicio dedicado, aislado de los componentes) —
  usará `VideoSegment[]` como entrada, sea cual sea el modo.
- Descarga de los fragmentos resultantes.

Formatos de vídeo aceptados por ahora: MP4, WebM, MOV y OGV (los que los
navegadores reproducen de forma nativa con `<video>`, necesario para la
previsualización). Si más adelante hace falta aceptar más contenedores,
habrá que revisar esta decisión.

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
- `npm run test` — ejecuta los tests una vez (Vitest).
- `npm run test:watch` — tests en modo watch.

## Antes de hacer deploy

`npm run dev` **no** hace comprobación de tipos completa (por diseño, para ser rápido). Antes de subir cambios, corre:

```bash
npm run typecheck
npm run build
```

Si estos dos pasan localmente, el deploy en Vercel/Netlify no debería fallar por errores de TypeScript.

(Nota: `src/vite-env.d.ts` es necesario para que TypeScript entienda los imports de `.css` y `.module.css`. Si algún día se borra por error, `tsc -b` fallará con `Cannot find module '...css'` — así se detectó y arregló este archivo la primera vez.)

## Diseño: neumorfismo + brutalismo

La interfaz combina dos lenguajes visuales, repartidos por criterio (no mezclados al azar):

- **Neumorfismo** (`src/styles/neumorphic.module.css`, clases `.raised` / `.inset`) — solo en
  superficies **pasivas**: el slot donde se suelta el vídeo, el marco del preview. Da la
  sensación "cómoda"/táctil que se pidió.
- **Brutalismo** (`src/styles/brutalist.module.css`, clases `.panel` / `.button`) — en todo lo
  **accionable o estructural**: botones, errores, la línea de corte del header. Alto contraste
  siempre, para que el estado (hover, presionado, deshabilitado) nunca dependa de una sombra sutil.

**Por qué el reparto es así y no al revés:** el neumorfismo clásico en botones es un problema
de accesibilidad conocido (los estados casi no se distinguen visualmente). Al reservarlo para
superficies no interactivas y usar brutalismo (alto contraste) en todo lo accionable, se evita
ese problema sin renunciar a la estética. Nuevos componentes deberían seguir el mismo criterio.

## Despliegue

Pensado para Vercel como sitio estático (framework preset: Vite). No hace falta `vercel.json` todavía porque no usamos cabeceras especiales; se añadirá si en un futuro incremento usamos el núcleo multi-hilo de FFmpeg.wasm (requiere `Cross-Origin-Opener-Policy` / `Cross-Origin-Embedder-Policy`).
