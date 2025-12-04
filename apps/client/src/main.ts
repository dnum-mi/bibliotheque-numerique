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

const BnPreset = definePreset(Aura, {
  primitive: {
    borderRadius: '0.5rem',
    blueFrance: {
      50: '#000091',
      100: '#000091',
      113: '#000091', // blue-france-sun-113
      525: '#0063cb', // blue-france-main-525
      625: '#1212ff',
      725: '#2323ff', // blue-france-sun-113
      925: '#f0f0ff',
      950: '#e5e5f7',
    },
    redMarianne: {
      425: '#ff6a6a',
      625: '#e1000f',
      850: '#ffebeb',
      975: '#fff9f9',
    },
    grey: {
      50: '#161616',
      200: '#cecece',
      425: '#666666',
      625: '#929292',
      850: '#e5e5e5',
      925: '#f0f0f0',
      950: '#f6f6f6',
      975: '#fafafa',
      1000: '#ffffff',
    },
    info: {
      75: '#171d2e',
      100: '#1d2437',
      125: '#222a3f',
      200: '#273961',
      425: '#0063cb',
      525: '#0078f3', // info-main-525
      625: '#518fff',
      850: '#bccdff',
      925: '#dde5ff',
      950: '#e8edff',
      975: '#f4f6ff',
    },
    success: {
      75: '#142117',
      100: '#19271d',
      125: '#1e2e22',
      200: '#204129',
      425: '#18753c',
      525: '#1f8d49', // success-main-525
      625: '#27a658',
      850: '#3bea7e',
      925: '#88fdaa',
      950: '#b8fec9',
      975: '#dffee6',
    },
    warning: {
      75: '#2d1814',
      100: '#361e19',
      125: '#3e231e',
      200: '#5d2c20',
      425: '#b34000',
      525: '#d64d00', // warning-main-525
      625: '#fc5d00',
      850: '#ffbeb4',
      925: '#ffded9',
      950: '#ffe9e6',
      975: '#fff4f3',
    },
    error: {
      75: '#301717',
      100: '#391c1c',
      125: '#412121',
      200: '#642626',
      425: '#ce0500',
      525: '#f60700', // error-main-525
      625: '#ff5655',
      850: '#ffbdbd',
      925: '#fdd',
      950: '#ffe9e9',
      975: '#fff4f4',
    },
  },
  semantic: {
    primary: {
      50: '{blueFrance.950}',
      100: '{blueFrance.925}',
      200: '{blueFrance.925}',
      300: '{blueFrance.625}',
      400: '{blueFrance.525}',
      500: '{blueFrance.525}',
      600: '{blueFrance.113}',
      700: '{blueFrance.113}',
      800: '{blueFrance.113}',
      900: '{blueFrance.113}',
      950: '{blueFrance.113}',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{blueFrance.113}',
          contrastColor: '#ffffff',
          hoverColor: '{blueFrance.625}',
          activeColor: '{blueFrance.625}',
        },
        surface: {
          0: '#ffffff',
          50: '{grey.975}',
          100: '{grey.950}',
          200: '{grey.925}',
          300: '{grey.850}',
          400: '{grey.625}',
          500: '{grey.425}',
          600: '{grey.200}',
          700: '{grey.50}',
          800: '#161616',
          900: '#000000',
          950: '#000000',
        },
      },
    },
  },
  components: {
    button: {
      colorScheme: {
        light: {
          root: {
            primary: {
              background: '{blueFrance.113}',
              hoverBackground: '{blueFrance.725}',
              activeBackground: '{blueFrance.625}',
              borderColor: '{blueFrance.113}',
              hoverBorderColor: '{blueFrance.725}',
              activeBorderColor: '{blueFrance.625}',
              color: '#ffffff',
              hoverColor: '#ffffff',
              activeColor: '#ffffff',
              focusRing: {
                color: '{blueFrance.113}',
                shadow: 'none',
              },
            },
            info: {
              background: '{info.425}',
              hoverBackground: '{info.525}',
              activeBackground: '{info.625}',
              borderColor: '{info.425}',
              hoverBorderColor: '{info.525}',
              activeBorderColor: '{info.625}',
              color: '#ffffff',
              hoverColor: '#ffffff',
              activeColor: '#ffffff',
              focusRing: {
                color: '{info.425}',
                shadow: 'none',
              },
            },
            success: {
              background: '{success.425}',
              hoverBackground: '{success.525}',
              activeBackground: '{success.625}',
              borderColor: '{success.425}',
              hoverBorderColor: '{success.525}',
              activeBorderColor: '{success.625}',
              color: '#ffffff',
              hoverColor: '#ffffff',
              activeColor: '#ffffff',
              focusRing: {
                color: '{success.425}',
                shadow: 'none',
              },
            },
            warn: {
              background: '{warning.525}',
              hoverBackground: '{warning.625}',
              activeBackground: '{warning.625}',
              borderColor: '{warning.525}',
              hoverBorderColor: '{warning.625}',
              activeBorderColor: '{warning.625}',
              color: '#ffffff',
              hoverColor: '#ffffff',
              activeColor: '#ffffff',
              focusRing: {
                color: '{warning.525}',
                shadow: 'none',
              },
            },
            danger: {
              background: '{error.525}',
              hoverBackground: '{error.625}',
              activeBackground: '{error.625}',
              borderColor: '{error.525}',
              hoverBorderColor: '{error.625}',
              activeBorderColor: '{error.625}',
              color: '#ffffff',
              hoverColor: '#ffffff',
              activeColor: '#ffffff',
              focusRing: {
                color: '{error.525}',
                shadow: 'none',
              },
            },
          },
          text: {
            primary: {
              hoverBackground: '{blueFrance.950}',
              activeBackground: '{blueFrance.925}',
              color: '{blueFrance.113}',
            },
            info: {
              hoverBackground: '{info.950}',
              activeBackground: '{info.925}',
              color: '{info.425}',
            },
            success: {
              hoverBackground: '{success.950}',
              activeBackground: '{success.925}',
              color: '{success.425}',
            },
            warn: {
              hoverBackground: '{warning.950}',
              activeBackground: '{warning.925}',
              color: '{warning.525}',
            },
            danger: {
              hoverBackground: '{error.950}',
              activeBackground: '{error.925}',
              color: '{error.525}',
            },
          },
        },
      },
    },
    datatable: {
      headerCell: {
        selectedBackground: '{blueFrance.925}',
        selectedColor: '{blueFrance.625}',
        padding: '0.125rem 0.5rem',
      },
      bodyCell: {
        selectedBackground: '{danger.925}',
        selectedColor: '{danger.625}',
        padding: '0.125rem 0.5rem',
      },
      row: {
        hoverBackground: '{blueFrance.925}',
      },
      paginatorBottom: {
        borderWidth: '0',
      },
    },
    multiselect: {
      chip: {
        background: '{blueFrance.925}',
        color: '{blueFrance.113}',
      },
      dropdown: {
        hoverBackground: '{blueFrance.925}',
      },
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
      numeric: ['equals', 'notEquals', 'lessThan', 'lessThanOrEqual', 'greaterThan', 'greaterThanOrEqual'],
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
      greaterThan: 'Supérieur à',
      greaterThanOrEqual: 'Supérieur ou égal à',
      lessThan: 'Inférieur à',
      lessThanOrEqual: 'Inférieur ou égal à',
      dateBefore: 'Avant',
      dateAfter: 'Après',
      dateIs: 'Est le',
      dateIsNot: 'N’est pas le',
      clear: 'Effacer',
      apply: 'Appliquer',
      addRule: 'Ajouter une règle',
      removeRule: 'Supprimer la règle',
      matchAll: 'Satisfaire tous',
      matchAny: 'Satisfaire au moins un',
      monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    } as any,
  } satisfies PrimeVueConfiguration)
  .mount('#app')
