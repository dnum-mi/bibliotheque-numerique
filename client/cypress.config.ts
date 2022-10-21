import { defineConfig } from 'cypress'

export default defineConfig({
  video: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents (on, config) {
      return require('./cypress/plugins/index.ts')(on, config)
    },
    baseUrl: 'http://localhost:5050',
    specPattern: 'cypress/e2e/**/*.{cy,e2e}.ts',
  },

  component: {
    setupNodeEvents (on, config) {},
    viewportHeight: 500,
    viewportWidth: 1000,
    specPattern: 'src/**/*.{ct,cy,e2e}.{js,ts,jsx,tsx}',
    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
  },
})
