import '@gouvminint/vue-dsfr/styles'
import '../main.css'

import { generateDossierDS } from './__tests__/dossiers'

import DossierInformations from './DossierInformations.vue'
import { stateToFr } from '@/utils/stateToString'
import { booleanToYesNo } from '@/utils/booleanToString'
import { dateToStringFr } from '@/utils/dateToString'

describe('<DossierInformations />', () => {
  const labelValues = [
    // 'Numero de dossier',
    'Etat',
    'Archivé',
    'Date de dépot',
    'Date de passage en construction',
    'Date de derniére modification',
    'Date de passage en instruction',
    'Date de traitement',
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
    // see: https://test-utils.vuejs.org/guide/
    cy.mount(DossierInformations, { props: { datas } })
    cy.get('label').then(($label) => {
      // cy.wrap($label).contains('Numero de dossier').next().should('contain', datas.number)
      cy.wrap($label).contains('Etat').next().should('contain', stateToFr(datas.state))
      cy.wrap($label).contains('Archivé').next().should('contain', booleanToYesNo(datas.archived))
      cy.wrap($label).contains('Date de dépot').next().should('contain', dateToStringFr(datas.dateDepot))
      cy.wrap($label).contains('Date de derniére modification').next().should('contain', dateToStringFr(datas.dateDerniereModification))
      cy.wrap($label).contains('Date de passage en construction').next().should('contain', dateToStringFr(datas.datePassageEnConstruction))
      cy.wrap($label).contains('Date de passage en instruction').next().should('contain', dateToStringFr(datas.datePassageEnInstruction))
      cy.wrap($label).contains('Date de traitement').next().should('contain', dateToStringFr(datas.dateTraitement))
    })
  })
})
