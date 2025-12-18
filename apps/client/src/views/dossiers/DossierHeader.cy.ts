import '@gouvminint/vue-dsfr/styles'
import '@/main.css'

import { generateDossierWithFields, getBasicAssociation } from '@/views/__tests__/dossiers'

import DossierHeader from './DossierHeader.vue'

describe('<DossierHeader />', () => {
  it('renders', () => {
    const dossier = generateDossierWithFields()
    const organisme = getBasicAssociation()

    cy.mount(DossierHeader, { props: { dossier, organisme } })
    cy.get('header')
      .should('contain', dossier.sourceId)
      .should('contain', organisme.title)
      .should('contain', organisme.title)
  })
})
