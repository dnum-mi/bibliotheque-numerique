/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5172,
    proxy: {
      '^/api/rnf': {
        target: 'http://localhost:3001',
        rewrite: (value: string) => value.replace(/^\/api\/rnf/, '/api'),
      },
    },
  },
  plugins: [
    vue(),
    vueJsx(),
    VitePWA({}),
  ],
  base: process.env.BASE_URL || '/rnf',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
