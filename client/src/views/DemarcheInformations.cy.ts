import { LANG_FOR_DATE_TIME } from '@/config'
import '@gouvminint/vue-dsfr/styles'
import '../main.css'

import DemarcheInformations from './DemarcheInformations.vue'

import { generateDemarche } from './__tests__/demarches'

describe('<DemarcheDescription />', () => {
  const labelValues = [
    'Description',
    'Etat',
    'Date de création',
    'Date de dépublication',
    'Date de derniére modification',
    'Date de fermeture',
    'Date de publication',
    'Déclarative',

  ]
  it('renders without props', () => {
    cy.mount(DemarcheInformations)

    cy.get('label').then(($label) => {
      labelValues.forEach(labelValue =>
        cy.wrap($label).should('contain', labelValue),
      )
    })
  })

  it('renders with props', () => {
    const datas = generateDemarche()
    cy.mount(DemarcheInformations, { props: { datas } })
    cy.get('label').then(($label) => {
      cy.wrap($label).contains('Description').next().should('contain', datas.description)
      cy.wrap($label).contains('Etat').next().should('contain', 'Publiée')
      cy.wrap($label).contains('Date de création').next().should('contain', new Date(datas.dateCreation).toLocaleString(LANG_FOR_DATE_TIME))
      cy.wrap($label).contains('Date de dépublication').next().should('contain', '')
      cy.wrap($label).contains('Date de derniére modification').next().should('contain', new Date(datas.dateDerniereModification).toLocaleString(LANG_FOR_DATE_TIME))
      cy.wrap($label).contains('Date de fermeture').next().should('contain', '')
      cy.wrap($label).contains('Date de publication').next().should('contain', new Date(datas.datePublication).toLocaleString(LANG_FOR_DATE_TIME))
    })
  })
})
