import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // FFmpeg.wasm crea su propio Web Worker internamente; excluirlo del
  // pre-bundling de Vite evita que eso se rompa. Es la config que usa el
  // propio repositorio oficial de ffmpeg.wasm en sus ejemplos con Vite.
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
})
