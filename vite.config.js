// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite';

module.exports = defineConfig({
  base: '/dragline/',
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  }
})