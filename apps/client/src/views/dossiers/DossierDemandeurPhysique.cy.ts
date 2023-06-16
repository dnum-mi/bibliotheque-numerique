import '@gouvminint/vue-dsfr/styles'
import '@/main.css'

import { getDemandeurPhysique } from '@/views/__tests__/dossiers'

import DossierDemandePhysique from './DossierDemandeurPhysique.vue'
import { dateToStringFr } from '@/utils/dateToString'

describe('<DossierDemandePhysique />', () => {
  it('renders', () => {
    const datas = getDemandeurPhysique()
    // see: https://test-utils.vuejs.org/guide/
    cy.mount(DossierDemandePhysique, { props: { datas } })
    // TODO: A compléter suivant le besoin réél
    cy.get('label').then(($label) => {
      cy.wrap($label).contains('Civilité').next().should('contain', datas.civilite.toUpperCase())
      cy.wrap($label).contains('Nom').next().should('contain', datas.nom.toUpperCase())
      cy.wrap($label).contains('Prénom').next().should('contain', datas.prenom.toUpperCase())
      cy.wrap($label).contains('Date de naissance').next().should('contain', dateToStringFr(datas.dateDeNaissance))
    })
  })
})
