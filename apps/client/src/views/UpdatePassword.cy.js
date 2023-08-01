import UpdatePassword from './UpdatePassword.vue'

const shortPassword = 'a'
const simplePassword = 'abcd1234'
const goodPassword = 'abcd1234ABCD#!*0123'
const goodPassword2 = 'abcd1234ABCD#!*0124'

describe('<UpdatePassword />', () => {
  it('renders sucess', () => {
    cy.intercept('/api/users/user', { success: true })
    cy.mount(UpdatePassword, { props: { token: 'token' } })
    cy.get('button').click()
    cy.get('.fr-error-text').should('contain.text', 'Veuillez saisir un mot de passe')

    cy.get('#newPassword').type(shortPassword)
    cy.get('.fr-error-text').should('contain.text', 'Le mot de passe doit contenir au moins 15 caractères')

    cy.get('#confirmPassword').type(shortPassword)
    cy.get('.fr-error-text').should('contain.text', 'Le mot de passe doit contenir au moins 15 caractères')

    cy.get('#newPassword')
      .clear()

    cy.get('#newPassword')
      .type(goodPassword)
    cy.get('#confirmPassword').type(goodPassword2)
    cy.get('button').click()
    cy.get('.fr-error-text').should('contain.text', 'Les mots de passe ne correspondent pas')

    cy.get('#confirmPassword')
      .clear()
    cy.get('#confirmPassword')
      .type(goodPassword)
    cy.get('button').click()
    cy.get('.fr-alert')
      .should('have.class', 'fr-alert--success')
      .should('contain.text', 'Votre mot de passe a été changé.')
  })

  it('renders failed 400', () => {
    failedTest(400, 'Le nouveau mot de passe ne respecte pas le niveau de sécurité demandé')
  })

  it('renders failed 500', () => {
    failedTest(500, 'Une erreur inconnue est survenue')
  })
})

function failedTest (statusCode, message) {
  cy.intercept('/api/users/user', { statusCode, message: 'erreur ...' })
  cy.mount(UpdatePassword, { props: { token: 'token' } })

  cy.get('#newPassword')
    .type(goodPassword)
  cy.get('#confirmPassword').type(goodPassword)
  cy.get('button').click()
  cy.get('.fr-alert')
    .should('have.class', 'fr-alert--error')
    .should('contain.text', message)
}
