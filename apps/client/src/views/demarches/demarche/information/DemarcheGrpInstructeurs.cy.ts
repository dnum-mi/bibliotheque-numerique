import '@gouvminint/vue-dsfr/styles'
import '@/main.css'

import VueDsfr from '@gouvminint/vue-dsfr'

import DemarcheGrpInstructeurs from './DemarcheGrpInstructeurs.vue'
import { createPinia, type Pinia } from 'pinia'
import { useDemarcheStore } from '@/stores'
import { generateDemarche } from '@/views/__tests__/demarches'

describe('<DemarcheGrpInstructeurs />', () => {
  it('renders', () => {
    const useStore = useDemarcheStore()
    const demarche = generateDemarche()
    useStore.currentDemarche = demarche

    cy.mountWithPinia(DemarcheGrpInstructeurs)

    cy.log('demarche?.dsDataJson?.groupeInstructeurs', JSON.stringify(demarche?.dsDataJson?.groupeInstructeurs))
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
