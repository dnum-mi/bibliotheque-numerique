import Signin from './Signin.vue'
import { createPinia } from 'pinia'
import { createRandomUserForm } from '@/views/__tests__/users'

describe('<Signin />', () => {
  const stores = createPinia()
  const newUser = createRandomUserForm()

  it('form not validated', () => {
    cy.mount(Signin, {
      stores,
    })

    cy.get('#email').type('louis.dubois')
    cy.get('.fr-error-text').should('contain.text', 'Ceci semble être une adresse email invalide')
    cy.get('#email').type('@gmail.com')
    cy.get('.fr-error-text').should('not.exist')

    cy.get('#password').type('xx')
    cy.get('.fr-error-text').should('contain.text', 'Le mot de passe doit contenir au moins 6 caractères')
    cy.get('#password').type('etsiarn')
    cy.get('.fr-error-text').should('not.exist')
  })

  it('form is validated', () => {
    cy.mount(Signin, {
      stores,
    })
    cy.log(newUser.email)
    cy.log(newUser.password)

    cy.get('#email').type(newUser.email)
    cy.get('#password').type(newUser.password)
    cy.get('.fr-error-text').should('not.exist')
  })
})
