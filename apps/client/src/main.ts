import 'virtual:uno.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import VueDsfr from '@gouvminint/vue-dsfr'

import App from './App.vue'
import router from './router'

import '@gouvfr/dsfr/dist/core/core.main.min.css' // Le CSS minimal du DSFR
import '@gouvfr/dsfr/dist/component/component.main.min.css' // Styles de tous les composants
import '@gouvfr/dsfr/dist/utility/utility.main.min.css' // Classes utilitaires: les composants de VueDsfr en ont besoin
import '@gouvminint/vue-dsfr/styles' // Les styles propres aux composants de VueDsfr

import '@gouvfr/dsfr/dist/scheme/scheme.min.css' // Facultatif: Si les thèmes sont utilisés (thème sombre, thème clair)
import '@gouvfr/dsfr/dist/utility/icons/icons.min.css' // Facultatif: Si des icônes sont utilisées avec les classes "fr-icon-..."

import * as icons from './icons'

import './main.css'

import StatusBadge from './components/StatusBadge.vue'

createApp(App)
  .use(createPinia())
  .component('StatusBadge', StatusBadge)
  .use(router)
  .use(VueDsfr, { icons: Object.values(icons) })
  .mount('#app')
