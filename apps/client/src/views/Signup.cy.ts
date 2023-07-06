import '@gouvminint/vue-dsfr/styles'
import '../main.css'

import VueDsfr from '@gouvminint/vue-dsfr'

import Signup from './Signup.vue'

describe('<Signup />', () => {
  const extensions = {
    use: [
      VueDsfr,
    ],
  }

  it('form not validated', () => {
    cy.mount(Signup, {
      extensions,
    })

    cy.get('#firstName').type('d')
    cy.get('.fr-error-text').should('contain.text', 'Ceci ne semble pas être un prénom')

    cy.get('#lastName').type('l')
    cy.get('.fr-error-text').should('contain.text', 'Ceci ne semble pas être un nom')

    cy.get('#email').type('louis.dubois')
    cy.get('.fr-error-text').should('contain.text', 'Ceci semble être une adresse email invalide')

    cy.get('#password').type('xx')
    cy.get('.fr-error-text').should('contain.text', 'Le mot de passe doit contenir au moins 15 caractères')
  })

  it('form is validated', () => {
    cy.mount(Signup, {
      extensions,
    })

    cy.get('#firstName').type('dubois')
    cy.get('#lastName').type('louis')
    cy.get('#email').type('louis.dubois@interieur.gouv.fr')
    cy.get('#password').type('IsVeryComplicatedPassword#077')
    cy.get('.fr-error-text').should('not.exist')
  })
})
