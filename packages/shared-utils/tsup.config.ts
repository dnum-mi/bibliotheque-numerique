import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  sourcemap: true,
  experimentalDts: true,
  clean: true,
  format: ['cjs', 'esm'],
  outExtension({ format }) {
    return {
      js: `.${format}.js`,
    }
  },
})
