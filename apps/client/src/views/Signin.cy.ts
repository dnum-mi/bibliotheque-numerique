import Signin from './Signin.vue'
import { createRandomUserForm } from '@/views/__tests__/users'

describe('<Signin />', () => {
  const newUser = createRandomUserForm()

  it('form not validated', () => {
    cy.mount(Signin)

    cy.get('#email').type('louis.dubois')
    cy.get('.fr-error-text').should('contain.text', 'Ceci semble être une adresse email invalide')
    cy.get('#email').type('@gmail.com')
    cy.get('.fr-error-text').should('not.exist')

    cy.get('#password').type('xx')
    cy.get('.fr-error-text').should('contain.text', 'Le mot de passe doit contenir au moins 15 caractères')
    cy.get('#password').type('A1etsn*!etisan34')
    cy.get('.fr-error-text').should('not.exist')
  })

  it('form is validated', () => {
    cy.mount(Signin)
    cy.log(newUser.email)
    cy.log(newUser.password)

    cy.get('#email').type(newUser.email)
    cy.get('#password').type(newUser.password)
    cy.get('.fr-error-text').should('not.exist')
  })
})
