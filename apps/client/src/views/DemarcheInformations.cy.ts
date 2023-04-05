import { LANG_FOR_DATE_TIME } from '@/config'
import '@gouvminint/vue-dsfr/styles'
import '../main.css'
import { createPinia } from 'pinia'

import DemarcheInformations from './DemarcheInformations.vue'
import { generateDemarche } from './__tests__/demarches'
import { useDemarcheStore } from '@/stores'
import VueDsfr from '@gouvminint/vue-dsfr'

describe('<DemarcheDescription />', () => {
  const pinia = createPinia()
  const extensions = {
    use: [
      VueDsfr,
    ],
  }

  it('renders with props', () => {
    const useStore = useDemarcheStore(pinia)
    const demarche = generateDemarche()
    useStore.demarche = demarche
    useStore.getDemarche = async (id: number) => {
      useStore.demarche = demarche
    }

    const datas = demarche.demarcheDS.dataJson
    cy.mount(DemarcheInformations, { extensions })
    cy.get('label').then(($label) => {
      cy.wrap($label).contains('Description').next().should('contain', datas.description)
      cy.wrap($label).contains('Etat').next().should('contain', 'Publiée')
      cy.wrap($label).contains('Date de création').next().should('contain', new Date(datas.dateCreation).toLocaleString(LANG_FOR_DATE_TIME))
      cy.wrap($label).contains('Date de dépublication').next().should('contain', '')
      cy.wrap($label).contains('Date de dernière modification').next().should('contain', new Date(datas.dateDerniereModification).toLocaleString(LANG_FOR_DATE_TIME))
      cy.wrap($label).contains('Date de fermeture').next().should('contain', '')
      cy.wrap($label).contains('Date de publication').next().should('contain', new Date(datas.datePublication).toLocaleString(LANG_FOR_DATE_TIME))
    })
  })
})
