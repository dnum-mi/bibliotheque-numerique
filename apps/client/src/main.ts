import 'virtual:uno.css'

import App from './App.vue'
import router from './router'

import '@gouvfr/dsfr/dist/core/core.main.min.css'
import '@gouvfr/dsfr/dist/component/component.main.min.css'
import '@gouvfr/dsfr/dist/utility/utility.main.min.css'
import '@gouvminint/vue-dsfr/styles'

import '@gouvfr/dsfr/dist/scheme/scheme.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons.min.css'
import { DsfrButton } from '@gouvminint/vue-dsfr'

import * as icons from './icons'

import './main.css'
import 'vue3-openlayers/styles.css'

import OpenLayersMap from 'vue3-openlayers'

import { LicenseManager } from 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-material.css'
import '@/ag-grid-dsfr.css'

// We use statusBadge in DsfrTable
import StatusBadge from './components/Badges/status/StatusBadge.vue'
import FileTagBadge from '@/components/Badges/file-tag/FileTagBadge.vue'
import OrganismeBadge from './components/Badges/organisme/OrganismeBadge.vue'

const agGridLicenseKey = '__AG_GRID_LICENSE_KEY__'

LicenseManager.setLicenseKey(agGridLicenseKey)

addIcons(...Object.values(icons))

createApp(App)
  .use(createPinia())
  .use(OpenLayersMap)
  .component('DsfrButton', DsfrButton)
  .component('OrganismeBadge', OrganismeBadge)
  .component('StatusBadge', StatusBadge)
  . component('FileTagBadge', FileTagBadge)
  .use(router)
  .mount('#app')
