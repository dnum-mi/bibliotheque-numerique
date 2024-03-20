import 'virtual:uno.css'

import App from './App.vue'
import router from './router'

import '@gouvfr/dsfr/dist/core/core.main.min.css'
import '@gouvfr/dsfr/dist/component/component.main.min.css'
import '@gouvfr/dsfr/dist/utility/utility.main.min.css'
import '@gouvminint/vue-dsfr/styles'

import '@gouvfr/dsfr/dist/scheme/scheme.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons.min.css'

import * as icons from './icons'

import './main.css'

import { LicenseManager } from 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-material.css'
import '@/ag-grid-dsfr.css'

// Code à supprimer en mars 2024 semaines quand plus aucun utilisateur n'aura l'ancien service worker
import './unregister.js'

// We use statusBadge in DsfrTable
import StatusBadge from './components/Badges/status/StatusBadge.vue'
import FileTagBadge from '@/components/Badges/file-tag/FileTagBadge.vue'

LicenseManager.setLicenseKey(import.meta.env.VITE_AG_GRID_LICENSE_KEY)

addIcons(...Object.values(icons))

if (import.meta.env.DEV && import.meta.env.VITE_CYPRESS !== 'true') {
  const { worker } = await import('./mocks/browser')
  await worker.start({
    onUnhandledRequest: (request) => {
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
  . component('FileTagBadge', FileTagBadge)
  .use(router)
  .mount('#app')
