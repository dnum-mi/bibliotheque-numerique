import '@gouvminint/vue-dsfr/styles'
import '@/main.css'

import { generateDossierDS } from '@/views/__tests__/dossiers'

import DossierInformations from './DossierInformations.vue'
import { dateTimeToStringFr } from '@/utils/dateToString'

describe('<DossierInformations />', () => {
  const labelValues = [
    'PRÉFECTURE',
    'DÉPÔT',
    'INTRUCTION',
    'PUBLICATION',
    'ÉTAT',
  ]

  it('renders without props', () => {
    cy.mount(DossierInformations)

    cy.get('label').then(($label) => {
      labelValues.forEach(labelValue =>
        cy.wrap($label).should('contain', labelValue),
      )
    })
  })

  it('renders', () => {
    const datas = generateDossierDS()
    cy.mount(DossierInformations, { props: { datas } })
    cy.get('label').then(($label) => {
      cy.wrap($label).contains('PRÉFECTURE').next().should('contain', datas.groupeInstructeur?.label.toUpperCase())
      cy.wrap($label).contains('DÉPÔT').next().should('contain', dateTimeToStringFr(datas.dateDepot))
      cy.wrap($label).contains('INTRUCTION').next().should('contain', dateTimeToStringFr(datas.datePassageEnInstruction))
      cy.wrap($label).contains('PUBLICATION').next().should('contain', '')
      cy.wrap($label).contains('ÉTAT').next().should('contain', datas.state?.toUpperCase())
    })
  })
})
