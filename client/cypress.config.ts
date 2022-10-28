import { defineConfig } from 'cypress'

export default defineConfig({
  video: false,
  // mailHogUrl: "http://localhost:8025",

  e2e: {
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    supportFile: 'cypress/support/index.ts',
    baseUrl: 'http://localhost:5050',
    specPattern: 'cypress/e2e/**/*.{cy,e2e}.ts',
  },

  component: {
    viewportHeight: 1024,
    viewportWidth: 1280,
    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
  },
})
