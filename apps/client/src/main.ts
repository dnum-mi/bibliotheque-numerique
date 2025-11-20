import 'virtual:uno.css'

import App from './App.vue'
import router from './router'

import '@gouvfr/dsfr/dist/core/core.main.min.css'
import '@gouvfr/dsfr/dist/component/component.main.min.css'
import '@gouvfr/dsfr/dist/utility/utility.main.min.css'
import '@gouvminint/vue-dsfr/styles'

import '@gouvfr/dsfr/dist/scheme/scheme.min.css'
import { DsfrButton } from '@gouvminint/vue-dsfr'

import collections from './icon-collections'
import { addCollection } from '@iconify/vue'

import './main.css'
import 'vue3-openlayers/vue3-openlayers.css'

import OpenLayersMap from 'vue3-openlayers'
import PrimeVue from 'primevue/config'
import type { PrimeVueConfiguration } from 'primevue/config'

import { LicenseManager } from 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-material.css'
import '@/ag-grid-dsfr.css'

// We use statusBadge in DsfrTable
import StatusBadge from './components/Badges/status/StatusBadge.vue'
import FileTagBadge from '@/components/Badges/file-tag/FileTagBadge.vue'
import OrganismeBadge from './components/Badges/organisme/OrganismeBadge.vue'

import Aura from '@primevue/themes/aura'
import { definePreset } from '@primevue/themes'
import { FilterService } from '@primevue/core/api'

const isBlank = (v: unknown) =>
  v == null
  || (typeof v === 'string' && v.trim().length === 0)
  || (Array.isArray(v) && v.length === 0)

FilterService.register('blank', (value: unknown) => isBlank(value))
FilterService.register('notBlank', (value: unknown) => !isBlank(value))

const agGridLicenseKey = '__AG_GRID_LICENSE_KEY__'

LicenseManager.setLicenseKey(agGridLicenseKey)

const BnPreset = definePreset(Aura, {
  primitive: {
    borderRadius: '0',
  },
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
    },
  },
})

for (const collection of collections) {
  addCollection(collection)
}
createApp(App)
  .use(createPinia())
  .use(OpenLayersMap)
  .component('DsfrButton', DsfrButton)
  .component('OrganismeBadge', OrganismeBadge)
  .component('StatusBadge', StatusBadge)
  .component('FileTagBadge', FileTagBadge)
  .use(router)
  .use(PrimeVue, {
    theme: {
      preset: BnPreset,
      options: {
        darkModeSelector: 'light',
      },
    },
    filterMatchModeOptions: {
      text: ['startsWith', 'contains', 'notContains', 'endsWith', 'equals', 'notEquals', 'blank', 'notBlank'],
      numeric: ['equals', 'notEquals', 'lt', 'lte', 'gt', 'gte'],
      date: ['dateIs', 'dateIsNot', 'dateBefore', 'dateAfter'],
    },
    locale: {
      startsWith: 'Commence par',
      contains: 'Contient',
      notContains: 'Ne contient pas',
      endsWith: 'Se termine par',
      equals: 'Égal à',
      notEquals: 'Différent de',
      blank: 'Vide',
      notBlank: 'Non vide',
      gt: 'Supérieur à',
      gte: 'Supérieur ou égal à',
      lt: 'Inférieur à',
      lte: 'Inférieur ou égal à',
      dateBefore: 'Avant',
      dateAfter: 'Après',
      dateIs: 'Est le',
      dateIsNot: 'N’est pas le',
      clear: 'Effacer',
      apply: 'Appliquer',
      matchAll: 'Satisfaire tous',
      matchAny: 'Satisfaire au moins un',
      monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    } as any,
  } satisfies PrimeVueConfiguration)
  .mount('#app')
