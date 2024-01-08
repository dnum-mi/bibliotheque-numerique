import { createRandomUser } from '@/views/__tests__/users'

import DemarcheGrpInstructeurs from './DemarcheGrpInstructeurs.vue'
import { useDemarcheStore } from '@/stores'
import { generateDemarche } from '@/views/__tests__/demarches'
import apiClient from '@/api/api-client'

describe('<DemarcheGrpInstructeurs />', () => {
  it('renders', () => {
    const demarcheStore = useDemarcheStore()
    const user = createRandomUser()
    // Prevent api calls
    cy.stub(apiClient, 'fetchMyProfile').returns(Promise.resolve(user))

    const demarche = generateDemarche()
    cy.stub(apiClient, 'getDemarche').withArgs(demarche.id)
      .returns(Promise.resolve(demarche))
    cy.then(() => {
      demarcheStore.getDemarche(demarche.id)
    })

    cy.mountWithPinia(DemarcheGrpInstructeurs)

    cy.get('h3').should('contain', 'Groupes Instructeurs')
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
