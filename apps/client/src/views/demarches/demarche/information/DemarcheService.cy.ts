import '@gouvminint/vue-dsfr/styles'

import DemarcheService from './DemarcheService.vue'

import { generateDemarche } from '@/views/__tests__/demarches'
import { createPinia } from 'pinia'
import { useDemarcheStore } from '@/stores'
import VueDsfr from '@gouvminint/vue-dsfr'

describe('<DemarcheService />', () => {
  it('renders with props', () => {
    const useStore = useDemarcheStore()
    const demarche = generateDemarche()
    useStore.currentDemarche = demarche
    const service = demarche.dsDataJson.service

    cy.mountWithPinia(DemarcheService)

    cy.get('label').then(($label) => {
      cy.wrap($label).contains('Nom').next().should('contain', service.nom)
      cy.wrap($label).contains('Organisme').next().should('contain', service.organisme)
      cy.wrap($label).contains('Siret').next().should('contain', service.siret)
      cy.wrap($label).contains('Type Organisme').next().should('contain', service.typeOrganisme)
    })
  })
})
