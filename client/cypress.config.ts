import { defineConfig } from 'cypress'

export default defineConfig({
  video: false,
  // mailHogUrl: "http://localhost:8025",

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
    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
  },
})
