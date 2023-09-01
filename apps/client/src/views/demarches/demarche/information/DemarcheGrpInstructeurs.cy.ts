import '@gouvminint/vue-dsfr/styles'
import '@/main.css'

import VueDsfr from '@gouvminint/vue-dsfr'

import DemarcheGrpInstructeurs from './DemarcheGrpInstructeurs.vue'
import { createPinia } from 'pinia'
import { useDemarcheStore } from '@/stores'
import { generateDemarche } from '@/views/__tests__/demarches'

describe('<DemarcheGrpInstructeurs />', () => {
  it('renders', () => {
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

    cy.mount(DemarcheGrpInstructeurs, { extensions })

    cy.get('h3').should('contain', 'Groupe Instructeurs')
    cy.get('section').then($section => {
      for (const grp of demarche.dsDataJson?.groupeInstructeurs) {
        cy.wrap($section)
          .contains(grp.label)
          .click()
        cy.wrap($section)
          .should('contain', grp.instructeurs[0].email)
      }
    })
  })
})
