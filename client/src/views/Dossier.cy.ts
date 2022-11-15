import '@gouvminint/vue-dsfr/styles'
import '../main.css'

import VueDsfr from '@gouvminint/vue-dsfr'

import { createPinia } from 'pinia'
import Dossier from './Dossier.vue'
import { useDossierStore } from '@/stores/dossier'
import { generateDossier } from './__tests__/dossiers'
import { dateToStringFr } from '@/utils/dateToString'

describe('<Dossier />', () => {
  it('renders', () => {
    const pinia = createPinia()
    // eslint-disable-next-line
    const useStore = useDossierStore(pinia)
    const dossier = generateDossier()
    const dossierDS = dossier.dossierDS.dataJson
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

    cy.get('h1').should('contain', `Dossier ${dossierDS.number}`)
    cy.get('h3').should('contain', 'Informations')
    cy.get('h3').contains('Informations').parent().contains('Date de dépot').next().should('contain', dateToStringFr(dossierDS.dateDepot))
  })
})
