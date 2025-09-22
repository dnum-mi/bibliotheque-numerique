import '@gouvminint/vue-dsfr/styles'
import '@/main.css'

import { generateDossierWithFields } from '@/views/__tests__/dossiers'

import DossierHeader from './DossierHeader.vue'

describe('<DossierHeader />', () => {
  it('renders', () => {
    const dossier = generateDossierWithFields()
    cy.mount(DossierHeader, { props: { dossier } })
    cy.get('header')
      .should('contain', dossier.sourceId)
      .should('contain', dossier.organisme.title)
      .should('contain', dossier.organisme.title)
  })
})
