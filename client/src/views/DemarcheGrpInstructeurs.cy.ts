import '@gouvminint/vue-dsfr/styles'
import '../main.css'

import VueDsfr from '@gouvminint/vue-dsfr'

import DemarcheGrpInstructeurs from './DemarcheGrpInstructeurs.vue'

describe('<DemarcheGrpInstructeurs />', () => {
  const extensions = {
    use: [
      VueDsfr,
    ],
  }

  it('renders without group instructeur', () => {
    cy.mount(DemarcheGrpInstructeurs, { extensions })
    cy.get('h3').should('contain', 'Groupe Instructeurs')
    cy.get('[data-cy="cy-grpInstucteur"]').should('not.exist')
  })

  it('renders', () => {
    const groupeInstructeurs = [
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
    ]

    cy.mount(DemarcheGrpInstructeurs, { extensions, props: { groupInstructeurs: groupeInstructeurs } })

    cy.get('h3').should('contain', 'Groupe Instructeurs')
    cy.get('section').then($section => {
      for (const grp of groupeInstructeurs) {
        cy.wrap($section)
          .contains(grp.label)
          .click()
          .parents('section')
          .should('contain', grp.instructeurs[0].email)
          .should('contain', grp.instructeurs[1].email)
      }
    })
  })
})
