import Dossier from './Dossier.vue'
import { useDossierStore } from '@/stores/dossier'
import { generateDossierWithFields, statusDictionary } from '@/views/__tests__/dossiers'

import apiClient from '@/api/api-client'

describe('<Dossier />', () => {
  it('renders', () => {
    const dossierStore = useDossierStore()
    const dossier = generateDossierWithFields()
    cy.stub(apiClient, 'getDossierWithFields').withArgs(+dossier.id).resolves(dossier).as('stubGetDossier')
    const dossierDS = dossier
    cy.then(() => {
      dossierStore.getDossierWithFields(+dossier.id)
    })

    cy.mountWithPinia(Dossier)

    cy.get('@stubGetDossier').should('be.called')
    cy.get('.bn-fiche-title').should('contain', `${dossierDS.sourceId}`)
    cy.get('.fr-badge').should('contain', `${dossierDS.state ? statusDictionary[dossierDS.state] : ''}`)
  })
})
