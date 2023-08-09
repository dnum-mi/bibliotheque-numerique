import '@gouvminint/vue-dsfr/styles'
import '@/main.css'

import VueDsfr from '@gouvminint/vue-dsfr'

import { createPinia } from 'pinia'
import Dossier from './Dossier.vue'
import { useDossierStore } from '@/stores/dossier'
import { generateDossier } from '@/views/__tests__/dossiers'

describe('<Dossier />', () => {
  it('renders', () => {
    const pinia = createPinia()
    // eslint-disable-next-line
    const useStore = useDossierStore(pinia)
    const dossier = generateDossier()
    const dossierDS = dossier.dsDataJson
    useStore.dossier = dossier
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    cy.get('.bn-fiche-title').should('contain', `${dossierDS.number}`)
    cy.get('.bn-fiche-sub-title').should('contain', `${dossierDS.state?.toUpperCase()}`)
  })
})
