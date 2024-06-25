import UpdatePassword from './UpdatePassword.vue'

const shortPassword = 'a'
const goodPassword = 'abcd1234ABCD#!*0123'
const goodPassword2 = 'abcd1234ABCD#!*0124'

describe('<UpdatePassword />', () => {
  it('renders sucess', () => {
    cy.intercept('/api/users', { success: true })
    cy.mount(UpdatePassword, { props: { token: 'token' } })

    cy.get('#newPassword').type(shortPassword)
    cy.get('.fr-error-text').should('contain.text', 'Le mot de passe doit contenir au moins 15 caractères')

    cy.get('#confirmPassword').type(shortPassword)
    cy.get('.fr-error-text').should('contain.text', 'Le mot de passe doit contenir au moins 15 caractères')

    cy.get('#newPassword')
      .clear()

    cy.get('#newPassword')
      .type(goodPassword)
    cy.get('#confirmPassword').type(goodPassword2)
    cy.get('button[type=submit]').click()
    cy.get('.fr-messages-group').should('contain.text', 'Les mots de passe ne correspondent pas')

    cy.get('#confirmPassword')
      .clear()
    cy.get('#confirmPassword')
      .type(goodPassword)
    cy.get('button[type=submit]').click()
  })

  it('renders failed 400', () => {
    failedTest(400, 'Le nouveau mot de passe ne respecte pas le niveau de sécurité demandé')
  })

  it('renders failed 500', () => {
    failedTest(500, 'Une erreur inconnue est survenue')
  })
})

function failedTest (statusCode, message) {
  cy.intercept('PUT', '/api/users', (req) => {
    req.reply(statusCode, { body: { statusCode, message: 'erreur...' } })
  }).as('updatePassword')
  cy.on('uncaught:exception', (err /* , runnable*/) => {
    console.warn(err)
    expect(err.message).to.include(message)
    return true
  })
  cy.mount(UpdatePassword, { props: { token: 'token' } })

  cy.get('#newPassword')
    .type(goodPassword)
  cy.get('#confirmPassword').type(goodPassword)
  cy.get('button[type=submit]').click()
}
