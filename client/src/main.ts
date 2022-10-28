import { createApp } from 'vue'
import { createPinia } from 'pinia'

import VueDsfr from '@gouvminint/vue-dsfr'

import App from './App.vue'
import router from './router/index'
import * as icons from './icons'

import '@gouvminint/vue-dsfr/styles'
import './main.css'

createApp(App)
  .use(createPinia())
  .use(router)
  .use(VueDsfr, { icons: Object.values(icons) })
  .mount('#app')
