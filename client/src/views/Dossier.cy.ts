import '@gouvminint/vue-dsfr/styles'
import '../main.css'

import VueDsfr from '@gouvminint/vue-dsfr'

import { createPinia } from 'pinia'
import Dossier from './Dossier.vue'
import { useDossierStore } from '@/stores/dossier'

describe('<Dossier />', () => {
  it('renders', () => {
    const pinia = createPinia()
    // eslint-disable-next-line
    const useStore = useDossierStore(pinia)
    const extensions = {
      use: [
        pinia,
        VueDsfr,
      ],
    }
    cy.mount(Dossier, {
      extensions,
    })

    cy.get('h1').should('contain', 'Dossier')
  })
})
