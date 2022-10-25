import '@gouvminint/vue-dsfr/styles'
import '../main.css'

import VueDsfr from '@gouvminint/vue-dsfr'

import { createPinia } from 'pinia'
import { useDemarcheStore } from '@/stores/demarche'
import DemarcheDossiers from './DemarcheDossiers.vue'

import { demarche1 } from './__tests__/demarche-2.js'
import { generateDossiers } from './__tests__/dossiers'

describe('<DemarcheDossiers />', () => {
  it('renders', () => {
    cy.viewport(1280, 1024)

    const pinia = createPinia()
    const useStore = useDemarcheStore(pinia)
    const demarche = demarche1.demarche
    useStore.demarche = demarche
    useStore.getDemarche = async (id: number) => {
      useStore.demarche = demarche
    }
    const dossiers = generateDossiers()
    useStore.dossiers = dossiers

    useStore.getDossiers = async (id: number) => {
      useStore.dossiers = dossiers
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

    cy.get('h3').should('contain', 'Information')
  })
})
