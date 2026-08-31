# scivissors

Corta fragmentos de vídeo directamente en el navegador. Sin backend, sin subir vídeos a ningún servidor: todo el procesamiento ocurre en el dispositivo del usuario con FFmpeg.wasm.

## Estado actual (incremento 6 de la hoja de ruta)

Implementado, además de lo anterior: **el corte real de vídeo con FFmpeg.wasm**,
tanto en modo automático como manual, con descarga de los fragmentos.

- `services/videoProcessor.ts` — aislado de la UI (sección 7): inicializa
  FFmpeg una sola vez, escribe el archivo de entrada una sola vez (no una vez
  por fragmento), corta cada segmento, limpia los archivos temporales
  siempre (incluso si algo falla), y traduce los fallos a mensajes en
  español pensados para el usuario.
- `hooks/useVideoProcessor.ts` + `components/ProcessingPanel.tsx` — botón de
  cortar, progreso, y enlaces de descarga por fragmento al terminar.

**Decisiones técnicas importantes (documentadas también en el código):**

- El núcleo de FFmpeg (~31MB) se carga desde un CDN (jsDelivr), no se
  auto-aloja en el repo. Ningún vídeo del usuario sale del navegador con
  esto — solo se descarga el motor de FFmpeg en sí, no datos del usuario.
  Si se prefiere no depender de un CDN externo más adelante, se puede
  auto-alojar copiando esos archivos a `/public/ffmpeg`.
- Se usa `-ss` (antes de `-i`, búsqueda rápida) junto con `-t` (duración
  relativa) — **no** `-to`, porque con `-ss` antes de `-i` la línea de
  tiempo se reinicia a 0 y `-to` dejaría de ser absoluto (es un error común
  y documentado de FFmpeg). Se re-codifica (libx264/aac) en vez de copiar
  el stream, para que el corte sea preciso al fotograma, no solo al
  keyframe más cercano.
- Se limita a 3 minutos por fragmento como tope de seguridad (FFmpeg.wasm
  tiene casos documentados de quedarse colgado sin avisar).

**Aviso de transparencia:** no pude instalar `@ffmpeg/ffmpeg`/`@ffmpeg/util`
en el entorno donde escribí este código (sin acceso a red), así que no pude
compilar ni probar esta parte de verdad — verifiqué toda la lógica que no
depende de sus tipos exactos, y confirmé por búsqueda web la API, las
versiones actuales y el comportamiento de `-ss`/`-to`, pero el primer
`npm run build` / prueba real en el navegador es el que da el veredicto final.

**Actualización — velocidad sobre precisión exacta (a petición explícita):**
el corte ahora **copia el stream** (`-c copy`) en vez de recodificar. Es
mucho más rápido (de decodificar+codificar todo el fragmento, a solo copiar
bytes), pero FFmpeg ya no puede cortar en el fotograma exacto pedido: el
inicio real cae en el keyframe más cercano, lo que puede desviarlo hasta un
par de segundos según el vídeo de origen. Esto se avisa también en la propia
interfaz, justo antes del botón de cortar. Además, el archivo de salida
ahora usa el mismo contenedor que el original (`.webm` → `.webm`, no
siempre `.mp4`), porque copiar un códec como VP9 dentro de un `.mp4` no
funciona — solo es válido el mismo contenedor que ya lo soportaba.

Si en algún momento se necesita volver a precisión exacta al fotograma,
la alternativa es recodificar (como estaba antes) o un "corte inteligente"
mixto (copiar el tramo entre keyframes, recodificar solo los bordes) — esto
último es bastante más complejo de implementar bien.

Pendiente: pulido general de UI/UX (responsive, accesibilidad de detalle).

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
