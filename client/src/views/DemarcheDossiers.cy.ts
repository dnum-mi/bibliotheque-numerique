import '@gouvminint/vue-dsfr/styles'
import VueDsfr from '@gouvminint/vue-dsfr'

import { createPinia } from 'pinia'
import { useDemarcheStore } from '@/stores/demarche'
import DemarcheDossiers from './DemarcheDossiers.vue'

describe('<DemarcheDossiers />', () => {
  it('renders', () => {
    // TODO: look configuration from cypress
    cy.viewport(1280, 1024)

    const pinia = createPinia()
    const useStore = useDemarcheStore(pinia)
    useStore.demarche = {
      title: 'test',
      number: 50,
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
  })
})
