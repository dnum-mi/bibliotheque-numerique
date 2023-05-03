import '@gouvminint/vue-dsfr/styles'
import '../main.css'

import { getDemandeurMorale } from './__tests__/dossiers'

import DossierDemandeurMoral from './DossierDemandeurMoral.vue'

describe('<DossierDemandeurMoral />', () => {
  it('renders without props', () => {
    // TODO: A compléter suivant le besoin réél
    const labelsDemandeurValue = [
      'Siret',
      'Siege Social',
      'Code NAF',
      'Libellé NAF',
    ]

    cy.mount(DossierDemandeurMoral)

    // TODO: A compléter suivant le besoin réél
    cy.get('label').then(($label) => {
      labelsDemandeurValue.forEach(labelValue =>
        cy.wrap($label).should('contain', labelValue),
      )
    })
  })

  it('renders', () => {
    const datas = getDemandeurMorale()
    // see: https://test-utils.vuejs.org/guide/
    cy.mount(DossierDemandeurMoral, { props: { datas } })
    // TODO: A compléter suivant le besoin réél
    cy.get('label').then(($label) => {
      cy.wrap($label).contains('Siret').next().should('contain', datas.siret)
      cy.wrap($label).contains('Siege Social').next().should('contain', datas.siegeSocial)
      cy.wrap($label).contains('Code NAF').next().should('contain', datas.naf)
      cy.wrap($label).contains('Libellé NAF').next().should('contain', datas.libelleNaf)
    })
  })
})
