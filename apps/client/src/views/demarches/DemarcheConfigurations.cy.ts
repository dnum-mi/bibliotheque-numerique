import { createPinia } from 'pinia'
import { useDemarcheStore } from '@/stores'
import DemarcheConfigurations from './DemarcheConfigurations.vue'

describe('<DemarcheConfigurations />', () => {
  it('renders', () => {
    const pinia = createPinia()
    useDemarcheStore(pinia)

    cy.mount(DemarcheConfigurations)

    cy.get('h3').should('contain', 'La configuration')
    cy.get('.fr-container')
      .should('contain', 'Type Champs')
      .should('contain', 'Libellé origine')
      .should('contain', 'Libellé personnalisé')
      .should('contain', 'Valeur Type')
      .should('contain', 'Mettre à jour')
  })
})
