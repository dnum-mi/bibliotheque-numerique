import '@gouvminint/vue-dsfr/styles'
import '@/main.css'

import { generateDossierDS } from '@/views/__tests__/dossiers'

import DossierTitle from './DossierTitle.vue'

describe('<DossierTitle />', () => {
  it('renders', () => {
    const datas = generateDossierDS()
    cy.mount(DossierTitle, { props: { datas } })
    cy.get('.fr-container')
      .should('contain', datas.number)
  })
})
