import '@gouvminint/vue-dsfr/styles'
import '@/main.css'
import * as icons from '@/icons'

import VueDsfr from '@gouvminint/vue-dsfr'

import { createPinia } from 'pinia'
import { useDemarcheStore } from '@/stores/demarche'
import DemarcheDossiers from './Demarche.vue'

import { generateDossiers } from '@/views/__tests__/dossiers'
import { generateDemarche } from '@/views/__tests__/demarches'

describe('<DemarcheDossiers />', () => {
  it('renders', () => {
    const pinia = createPinia()
    const useStore = useDemarcheStore(pinia)
    const demarche = generateDemarche()
    useStore.demarche = demarche
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    useStore.getDemarche = async (id: number) => {
      useStore.demarche = demarche
    }
    const dossiers = generateDossiers()
    useStore.dossiers = dossiers
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    useStore.getDossiers = async (id: number) => {
      useStore.dossiers = dossiers
    }

    const extensions = {
      use: [
        pinia,
        {
          install: (app) => {
            app.use(VueDsfr,
              { icons: Object.values(icons) },
            )
          },
        },
      ],
    }
    cy.mount(DemarcheDossiers, {
      extensions,
    })

    cy.get('.bn-list-search-title-dossier')
      .should('contain', `${demarche.dsDataJson.number}`)
      .should('contain', demarche.title)

    cy.get('h3').should('contain', 'Groupe Instructeurs')
    cy.get('h3').should('contain', 'Service')

    cy.get('h3').should('contain', 'Information')
  })
})
