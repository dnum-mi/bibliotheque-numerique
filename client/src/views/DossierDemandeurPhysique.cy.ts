import '@gouvminint/vue-dsfr/styles'
import '../main.css'

import { getDemandeurPhysique } from './__tests__/dossiers'

import DossierDemandePhysique from './DossierDemandeurPhysique.vue'

describe('<DossierDemandePhysique />', () => {
  it('renders without props', () => {
    const labelsDemandeurValue = [
      'Civilité',
      'Date de naissance',
      'Nom',
      'Prénom',
    ]

    cy.mount(DossierDemandePhysique)

    cy.get('label').then(($label) => {
      labelsDemandeurValue.forEach(labelValue =>
        cy.wrap($label).should('contain', labelValue),
      )
    })
  })

  it('renders', () => {
    const datas = getDemandeurPhysique()
    // see: https://test-utils.vuejs.org/guide/
    cy.mount(DossierDemandePhysique, { props: { datas } })
    // TODO: A compléter suivant le besoin réél
    cy.get('label').then(($label) => {
      cy.wrap($label).contains('Civilité').next().should('contain', datas.civilite)
      cy.wrap($label).contains('Date de naissance').next().should('contain', datas.dateDeNaissance)
      cy.wrap($label).contains('Nom').next().should('contain', datas.nom)
      cy.wrap($label).contains('Prénom').next().should('contain', datas.prenom)
    })
  })
})
