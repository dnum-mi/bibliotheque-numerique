import '@gouvminint/vue-dsfr/styles'
import '@/main.css'
import * as icons from '@/icons'

import VueDsfr from '@gouvminint/vue-dsfr'

import { createPinia } from 'pinia'
import { useDemarcheStore } from '@/stores/demarche'

import Demarches from './Demarches.vue'
import { generateDemarches } from '@/views/__tests__/demarches'

describe('<Demarches />', () => {
  it('renders', () => {
    const pinia = createPinia()
    const useStore = useDemarcheStore(pinia)
    useStore.demarches = generateDemarches()
    useStore.getDemarches = async () => {
      useStore.demarches = generateDemarches()
    }
    const extensions = {
      use: [
        pinia,
        {
          install: (app) => {
            app.use(VueDsfr,
              { icons: Object.values(icons) },
            )
          },
        },
      ],
    }

    cy.mount(Demarches, {
      extensions,
    })
  })
})
