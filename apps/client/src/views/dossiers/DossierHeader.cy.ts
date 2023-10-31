import '@gouvminint/vue-dsfr/styles'
import '@/main.css'

import { generateDossier } from '@/views/__tests__/dossiers'

import DossierHeader from './DossierHeader.vue'

describe('<DossierHeader />', () => {
  it('renders', () => {
    const dossier = generateDossier()
    cy.mount(DossierHeader, { props: { dossier } })
    cy.get('header')
      .should('contain', dossier.dsDataJson.number)
      .should('contain', dossier.organisme.title)
      .should('contain', dossier.organisme.title)
  })
})
