/// <reference types="vitest" />
import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import CommonJS from 'vite-plugin-commonjs'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {
  vueDsfrAutoimportPreset,
  ohVueIconAutoimportPreset,
  vueDsfrComponentResolver,
} from '@gouvminint/vue-dsfr'

const isCypress = process.env.CYPRESS === 'true'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    svgLoader(),
    UnoCSS(),
    CommonJS(),
    AutoImport({
      include: [
        /\.[tj]sx?$/,
        /\.vue$/, /\.vue\?vue/,
      ],
      imports: [
        'vue',
        'vue-router',
        'pinia',
        ...(isCypress ? [] : ['vitest']),
        vueDsfrAutoimportPreset,
        ohVueIconAutoimportPreset,
      ],
      vueTemplate: true,
      dts: './src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true,
      },
    }),
    Components({
      extensions: ['vue'],
      dirs: ['src/components'],
      // allow auto import and register components
      include: [/\.vue$/, /\.vue\?vue/],
      dts: './src/components.d.ts',
      resolvers: [
        vueDsfrComponentResolver,
      ],
    }),
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
      '@biblio-num/shared-utils': '@biblio-num/shared-utils/dist/index.esm.js',
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
