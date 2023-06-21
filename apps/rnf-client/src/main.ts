import '@gouvfr/dsfr/dist/dsfr.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons.min.css'

import '@gouvminint/vue-dsfr/styles'

import { createApp } from 'vue'

import VueDsfr from '@gouvminint/vue-dsfr'

import App from './App.vue'
import router from './router/index'
import * as icons from './icons'

import './main.css'

createApp(App)
  .use(router)
  .use(VueDsfr, { icons: Object.values(icons) })
  .mount('#app')
