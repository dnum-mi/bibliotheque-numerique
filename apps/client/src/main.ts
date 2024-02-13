import 'virtual:uno.css'

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

import 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-material.css'
import '@/ag-grid-dsfr.css'

// Code à supprimer en mars 2024 semaines quand plus aucun utilisateur n'aura l'ancien service worker
import './unregister.js'

// We use statusBadge in DsfrTable
import StatusBadge from './components/Badges/StatusBadge.vue'

addIcons(...Object.values(icons))

if (import.meta.env.DEV && import.meta.env.VITE_CYPRESS !== 'true') {
  const { worker } = await import('./mocks/browser')
  await worker.start({
    onUnhandledRequest: (request, print) => {
      const url = request.url
      if (!/\/api\//.test(url)) {
        return
      }
      console.log('Unhandled request:', new URL(request.url).pathname)
    },
  })
}

createApp(App)
  .use(createPinia())
  .component('StatusBadge', StatusBadge)
  .use(router)
  .mount('#app')
