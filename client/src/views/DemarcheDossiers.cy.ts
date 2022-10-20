import '@gouvminint/vue-dsfr/styles'
import '../main.css'

import VueDsfr from '@gouvminint/vue-dsfr'

import { createPinia } from 'pinia'
import { useDemarcheStore } from '@/stores/demarche'
import DemarcheDossiers from './DemarcheDossiers.vue'

describe('<DemarcheDossiers />', () => {
  it('renders', () => {
    // TODO: look configuration from cypress
    try {
      cy.viewport(1280, 1024)

      const pinia = createPinia()
      const useStore = useDemarcheStore(pinia)
      const demarche = {
        title: 'test',
        number: 50,
        groupeInstructeurs: [
          {
            number: 11,
            label: 'Test Gp Instructeur 1',
            instructeurs: [
              {
                id: 'test1',
                email: 'test.test@biblio.num',
              },
              {
                id: 'test2',
                email: 'test.test@biblio.num',
              },
            ],
          },
          {
            number: 12,
            label: 'Test Gp Instructeur 2',
            instructeurs: [
              {
                id: 'test3',
                email: 'test2.test@biblio.num',
              },
              {
                id: 'test4',
                email: 'test2.test@biblio.num',
              },
            ],
          },

        ],

        dossiers: {
          nodes: [
            {
              number: 0,
              archived: true,
              state: 'accepte',
              dateDepot: new Date(),
              datePassageEnConstruction: new Date(),
              datePassageEnInstruction: new Date(),
              dateTraitement: new Date(),
            },
            {
              number: 1,
              archived: true,
              state: 'en_construction',
              dateDepot: new Date(),
              datePassageEnConstruction: new Date(),
              datePassageEnInstruction: new Date(),
              dateTraitement: new Date(),
            },
          ],
        },
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
    } catch (error) {
      console.log(error)
    }
  })
})
