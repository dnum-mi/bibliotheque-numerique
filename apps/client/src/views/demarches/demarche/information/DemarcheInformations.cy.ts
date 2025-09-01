import { LOCALE_FOR_DATE_TIME } from '@/config'
import '@gouvminint/vue-dsfr/styles'
import '@/main.css'

import DemarcheInformations from './DemarcheInformations.vue'
import { generateDemarche } from '@/views/__tests__/demarches'
import { useDemarcheStore } from '@/stores'

describe('<DemarcheDescription />', () => {
  it('renders with props', () => {
    const useStore = useDemarcheStore()
    const demarche = generateDemarche()
    useStore.currentDemarche = demarche

    const datas = demarche.dsDataJson

    cy.mountWithPinia(DemarcheInformations)

    cy.get('label').then(($label) => {
      cy.wrap($label).contains('Description').next().should('contain', datas.description)
      cy.wrap($label).contains('Etat').next().should('contain', 'Publiée')
      cy.wrap($label).contains('Date de création').next().should('contain', new Date(datas.dateCreation).toLocaleString(LOCALE_FOR_DATE_TIME))
      cy.wrap($label).contains('Date de dépublication').next().should('contain', '')
      cy.wrap($label).contains('Date de dernière modification').next().should('contain', new Date(datas.dateDerniereModification).toLocaleString(LOCALE_FOR_DATE_TIME))
      cy.wrap($label).contains('Date de fermeture').next().should('contain', '')
      cy.wrap($label).contains('Date de publication').next().should('contain', new Date(datas.datePublication).toLocaleString(LOCALE_FOR_DATE_TIME))
    })
  })
})
