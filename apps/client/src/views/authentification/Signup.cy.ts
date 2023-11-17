import Signup from './Signup.vue'

describe('<Signup />', () => {
  it('form not validated', () => {
    cy.mount(Signup)
    cy.get('[type=submit]').as('submitBtn')
    cy.get('@submitBtn').should('be.disabled')

    cy.get('#firstname').type('d')
    cy.get('.fr-error-text').should('contain.text', 'Ceci ne semble pas être un prénom')
    cy.get('@submitBtn').should('be.disabled')

    cy.get('#lastname').type('l')
    cy.get('.fr-error-text').should('contain.text', 'Ceci ne semble pas être un nom')
    cy.get('@submitBtn').should('be.disabled')

    cy.get('#email').type('louis.dubois')
    cy.get('.fr-error-text').should('contain.text', 'Ceci semble être une adresse email invalide')
    cy.get('@submitBtn').should('be.disabled')

    cy.get('#password').type('xx')
    cy.get('@submitBtn').should('be.disabled')
  })

  it('form is validated', () => {
    cy.mount(Signup)
    cy.get('[type=submit]').as('submitBtn')
    cy.get('@submitBtn').should('be.disabled')

    cy.get('#firstname').type('dubois')
    cy.get('.fr-error-text').should('not.exist')
    cy.get('@submitBtn').should('be.disabled')
    cy.get('#lastname').type('louis')
    cy.get('.fr-error-text').should('not.exist')
    cy.get('@submitBtn').should('be.disabled')
    cy.get('#email').type('louis.dubois@interieur.gouv.fr')
    cy.get('.fr-error-text').should('not.exist')
    cy.get('@submitBtn').should('be.disabled')
    cy.get('#password').type('IsVeryComplicatedPassword#077')
    cy.get('.fr-error-text').should('not.exist')
    cy.get('@submitBtn').should('not.be.disabled')
  })
})
