import Dossier from './Dossier.vue'
import { useDossierStore } from '@/stores/dossier'
import { generateDossier, statusDictionary } from '@/views/__tests__/dossiers'

import apiClient from '@/api/api-client'

describe('<Dossier />', () => {
  it('renders', () => {
    const dossierStore = useDossierStore()
    const dossier = generateDossier()
    cy.stub(apiClient, 'getDossier').withArgs(+dossier.id).resolves(dossier).as('stubGetDossier')
    const dossierDS = dossier.dsDataJson
    cy.then(() => {
      dossierStore.getDossier(+dossier.id)
    })

    cy.mountWithPinia(Dossier)

    cy.get('@stubGetDossier').should('be.called')
    cy.get('.bn-fiche-title').should('contain', `${dossierDS.number}`)
    cy.get('.fr-badge').should('contain', `${dossierDS.state ? statusDictionary[dossierDS.state] : ''}`)
  })
})
