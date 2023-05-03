import '@gouvminint/vue-dsfr/styles'
import '../main.css'

import VueDsfr from '@gouvminint/vue-dsfr'

import Signin from './Signin.vue'
import { createPinia } from 'pinia'
import { createRandomUserForm } from '@/views/__tests__/users'

describe('<Signin />', () => {
  const pinia = createPinia()
  const newUser = createRandomUserForm()
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
    cy.log(newUser.email)
    cy.log(newUser.password)

    cy.get('#email').type(newUser.email)
    cy.get('#password').type(newUser.password)
    cy.get('.fr-error-text').should('not.exist')
  })
})
