import '@gouvminint/vue-dsfr/styles'
import '../main.css'

import VueDsfr from '@gouvminint/vue-dsfr'

import Signin from './Signin.vue'
import { createPinia } from 'pinia'

describe('<Signin />', () => {
  const pinia = createPinia()
  const extensions = {
    use: [
      pinia,
      VueDsfr,
    ],
  }

  it('form not validated', () => {
    cy.mount(Signin, {
      extensions,
    })

    cy.get('#email').type('louis.dubois')
    cy.get('.fr-error-text').should('contain.text', 'Format email incorrect')

    cy.get('#password').type('xx')
    cy.get('.fr-error-text').should('contain.text', 'Le mot de passe doit faire au moins 6 caractères')
  })

  it('form is validated', () => {
    cy.mount(Signin, {
      extensions,
    })

    cy.get('#password').type('xxxxxx')
    cy.get('.fr-error-text').should('not.exist')
  })
})
