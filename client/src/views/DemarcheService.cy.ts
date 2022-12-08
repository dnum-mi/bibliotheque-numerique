import '@gouvminint/vue-dsfr/styles'

import DemarcheService from './DemarcheService.vue'

import { generateDemarche } from './__tests__/demarches'

describe('<DemarcheService />', () => {
  it('renders without props', () => {
    cy.mount(DemarcheService)
    cy.get('label')
      .should('contain', 'Nom')
      .should('contain', 'Organisme')
      .should('contain', 'Siret')
      .should('contain', 'Type Organisme')
  })

  it('renders with props', () => {
    // see: https://test-utils.vuejs.org/guide/
    const service = generateDemarche().demarcheDS.dataJson.service
    cy.mount(DemarcheService, { props: { service } })
    cy.get('label').then(($label) => {
      cy.wrap($label).contains('Nom').next().should('contain', service.nom)
      cy.wrap($label).contains('Organisme').next().should('contain', service.organisme)
      cy.wrap($label).contains('Siret').next().should('contain', service.siret)
      cy.wrap($label).contains('Type Organisme').next().should('contain', service.typeOrganisme)
    })
  })
})
