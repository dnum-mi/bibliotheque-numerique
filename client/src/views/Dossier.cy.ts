import '@gouvminint/vue-dsfr/styles'
import '../main.css'

import VueDsfr from '@gouvminint/vue-dsfr'

import { createPinia } from 'pinia'
import Dossier from './Dossier.vue'
import { useDossierStore } from '@/stores/dossier'
import { generateDossier } from './__tests__/dossiers'

describe('<Dossier />', () => {
  it('renders', () => {
    const pinia = createPinia()
    // eslint-disable-next-line
    const useStore = useDossierStore(pinia)
    const dossier = generateDossier()
    useStore.dossier = dossier
    useStore.getDossier = async (id: number) => {
      useStore.dossier = dossier
    }

    const extensions = {
      use: [
        pinia,
        VueDsfr,
      ],
    }
    cy.mount(Dossier, {
      extensions,
    })

    cy.get('h1').should('contain', `Dossier ${dossier.number}`)
    cy.get('h3').should('contain', 'Information')
  })
})
