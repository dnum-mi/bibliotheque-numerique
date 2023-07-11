import '@gouvminint/vue-dsfr/styles'
import '@/main.css'

import { generateDossier } from '@/views/__tests__/dossiers'

import DossierTitle from './DossierTitle.vue'

describe('<DossierTitle />', () => {
  it('renders', () => {
    const datas = generateDossier()
    cy.mount(DossierTitle, { props: { datas } })
    cy.get('.fr-container')
      .should('contain', datas.dossierDS.dataJson.number)
      .should('contain', datas.demarche.title)
      .should('contain', datas.demarche.typeOrganisme)
  })
})
