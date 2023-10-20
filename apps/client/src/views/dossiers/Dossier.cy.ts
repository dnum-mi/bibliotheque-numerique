import Dossier from './Dossier.vue'
import { useDossierStore } from '@/stores/dossier'
import { generateDossier } from '@/views/__tests__/dossiers'

import apiClient from '@/api/api-client'

describe('<Dossier />', () => {
  it('renders', () => {
    const dossierStore = useDossierStore()
    const dossier = generateDossier()

    cy.stub(apiClient, 'getDossier').withArgs(+dossier.id).resolves(dossier)
    const dossierDS = dossier.dsDataJson
    cy.then(() => {
      dossierStore.getDossier(+dossier.id)
    })

    cy.mountWithPinia(Dossier)

    cy.get('.bn-fiche-title').should('contain', `${dossierDS.number}`)
    cy.get('.bn-fiche-sub-title').should('contain', `${dossierDS.state?.toUpperCase()}`)
  })
})
