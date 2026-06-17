import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import electron from 'vite-plugin-electron/simple'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
  },
  plugins: [
    preact(),
    electron({
      main: { entry: 'electron/main.js' },
      preload: { input: 'electron/preload.js' },
    }),
  ],
})
