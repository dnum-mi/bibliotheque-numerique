import 'virtual:uno.css'
import { ASK_RESET_PWD_SUCCESS } from '../messages'
import ResetPassword from './ResetPassword.vue'

describe('<ResetPassword />', () => {
  it('renders', () => {
    cy.intercept('/api/users/reset-password', { success: true })

    cy.mount(ResetPassword)

    cy.contains('Envoyer').click()
    cy.get('.fr-error-text').should('contain.text', 'Veuillez saisir votre adresse courriel')
    cy.get('#email').type('louis.dubois')
    cy.get('.fr-error-text').should('contain.text', 'L’adresse courriel ne semble pas valide')
    cy.get('#email').type('@gmail.com')
    cy.get('.fr-error-text').should('not.exist')
    cy.contains('Envoyer').click()
    cy.get('.fr-alert').should('contain', ASK_RESET_PWD_SUCCESS)
  })
})
