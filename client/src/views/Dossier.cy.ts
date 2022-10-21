import '@gouvminint/vue-dsfr/styles'
import '../main.css'

import VueDsfr from '@gouvminint/vue-dsfr'

import { createPinia } from 'pinia'
import Dossier from './Dossier.vue'
import { useDossierStore } from '@/stores/dossier'

describe('<Dossier />', () => {
  it('renders', () => {
    cy.viewport(1280, 1024)

    const pinia = createPinia()
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
