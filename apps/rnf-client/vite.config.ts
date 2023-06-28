/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

import { VitePWA } from 'vite-plugin-pwa'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'

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
    AutoImport({
      imports: [
        // presets
        'vue',
        'vue-router',
        'pinia',
        {
          '@vueuse/core': [
            'useMouse',
            'createReusableTemplate',
          ],
        },
        // example type import
        {
          from: 'vue-router',
          imports: ['RouteLocationRaw'],
          type: true,
        },
      ],
      dts: './auto-imports.d.ts',
      eslintrc: {
        enabled: true, // Default `false`
        filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
        globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
      },
    }),
  ],
  base: process.env.BASE_URL || '/rnf',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
