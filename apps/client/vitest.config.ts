import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import { configDefaults, defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      testTimeout: 2000,
      watch: false,
      setupFiles: [
        './vitest-setup.ts',
      ],
    },
    watch: false,
  }),
)
