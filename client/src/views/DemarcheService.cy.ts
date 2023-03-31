import '@gouvminint/vue-dsfr/styles'

import DemarcheService from './DemarcheService.vue'

import { generateDemarche } from './__tests__/demarches'
import { createPinia } from 'pinia'
import { useDemarcheStore } from '@/stores'
import VueDsfr from '@gouvminint/vue-dsfr'

describe('<DemarcheService />', () => {
  it('renders with props', () => {
    const pinia = createPinia()
    const useStore = useDemarcheStore(pinia)
    const demarche = generateDemarche()
    useStore.demarche = demarche
    useStore.getDemarche = async (id: number) => {
      useStore.demarche = demarche
    }
    const extensions = {
      use: [
        VueDsfr,
      ],
    }
    const service = demarche.demarcheDS.dataJson.service
    cy.mount(DemarcheService, { extensions })
    cy.get('label').then(($label) => {
      cy.wrap($label).contains('Nom').next().should('contain', service.nom)
      cy.wrap($label).contains('Organisme').next().should('contain', service.organisme)
      cy.wrap($label).contains('Siret').next().should('contain', service.siret)
      cy.wrap($label).contains('Type Organisme').next().should('contain', service.typeOrganisme)
    })
  })
})
