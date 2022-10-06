// https://docs.cypress.io/guides/guides/plugins-guide.html

// if you need a custom webpack configuration you can uncomment the following import
// and then use the `file:preprocessor` event
// as explained in the cypress docs
// https://docs.cypress.io/api/plugins/preprocessors-api.html#Examples

import { startDevServer } from '@cypress/vite-dev-server'
import path from 'path'

module.exports = (on, config) => {
  on('dev-server:start', (options) => {
    return startDevServer({
      options,
      viteConfig: {
        configFile: path.resolve(__dirname, '..', '..', 'vite.config.ts'),
      },
    })
  })

  // let's increase the browser window size when running headlessly this will produce higher resolution images and videos
  // https://on.cypress.io/browser-launch-api
  // on('before:browser:launch', (browser = {}, launchOptions) => {
  //   const width = 1600
  //   const height = 2560

  //   console.log(` Setting the ${browser.name} browser window size to ${width} x ${height}`)

  //   if (browser.name === 'chrome' && browser.isHeadless) {
  //     launchOptions.args.push(`--window-size=${width},${height}`)

  //     // force screen to be non-retina and just use our given resolution
  //     launchOptions.args.push('--force-device-scale-factor=1')
  //   }

  //   if (browser.name === 'electron' && browser.isHeadless) {
  //     launchOptions.preferences.width = width
  //     launchOptions.preferences.height = height
  //     launchOptions.preferences.resizable = false
  //   }

  //   if (browser.name === 'firefox' && browser.isHeadless) {
  //     launchOptions.args.push(`--width=${width}`)
  //     launchOptions.args.push(`--height=${height}`)
  //   }

  //   return launchOptions
  // })

  return Object.assign({}, config, {
    mailHogUrl: config.env.mailHogUrl || 'http://localhost:8025',
    fixturesFolder: 'cypress/fixtures',
    integrationFolder: 'cypress/integration',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    supportFile: 'cypress/support/index.ts',
  })
}
