/// <reference types="vitest" />
import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import svgLoader from 'vite-svg-loader'
import UnoCSS from 'unocss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    svgLoader(),
    VitePWA({
      workbox: {
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
    UnoCSS(),
  ],
  base: process.env.BASE_URL || '/',
  server: {
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    dedupe: ['vue', 'oh-vue-icons'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout: 2000,
    setupFiles: [
      './vitest-setup.ts',
    ],
  },
})
