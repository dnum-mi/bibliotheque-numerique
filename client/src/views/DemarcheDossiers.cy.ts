import '@gouvminint/vue-dsfr/styles'
import '../main.css'

import VueDsfr from '@gouvminint/vue-dsfr'

import { createPinia } from 'pinia'
import { useDemarcheStore } from '@/stores/demarche'
import DemarcheDossiers from './DemarcheDossiers.vue'

import { demarche2 } from './__tests__/demarche-2.js'

describe('<DemarcheDossiers />', () => {
  it('renders', () => {
    // TODO: look configuration from cypress
    try {
      cy.viewport(1280, 1024)

      const pinia = createPinia()
      const useStore = useDemarcheStore(pinia)
      const demarche = demarche2.demarche
      useStore.demarche = demarche
      useStore.getDemarche = (id: number) => {
        useStore.demarche = demarche
      }
      const extensions = {
        use: [
          pinia,
          VueDsfr,
        ],
      }
      cy.mount(DemarcheDossiers, {
        extensions,
      })

      cy.get('.title')
        .should('contain', `Démarche ${demarche.number}`)
        .should('contain', demarche.title)

      cy.get('h3').should('contain', 'Groupe Instructeurs')
      cy.get('h3').should('contain', 'Service')
    } catch (error) {
      console.log(error)
    }
  })
})
