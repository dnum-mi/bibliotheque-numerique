import VueDsfr from '@gouvminint/vue-dsfr'
import '@gouvfr/dsfr/dist/dsfr.min.css'
import '@gouvminint/vue-dsfr/styles'
import '@/main.css'
import * as icons from '@/icons'

import ResetPassword from './ResetPassword.vue'

describe('<ResetPassword />', () => {
  it('renders', () => {
    cy.intercept('/api/usr/reset-password', { success: true })
    const extensions = {
      use: [
        {
          install: (app) => {
            app.use(VueDsfr,
              { icons: Object.values(icons) },
            )
          },
        },
      ],
    }

    cy.mount(ResetPassword, {
      extensions,
    })

    cy.contains('Envoyer').click()
    cy.get('.fr-error-text').should('contain.text', 'Veuillez saisir votre adresse courriel')
    cy.get('#email').type('louis.dubois')
    cy.get('.fr-error-text').should('contain.text', 'L’adresse courriel ne semble pas valide')
    cy.get('#email').type('@gmail.com')
    cy.get('.fr-error-text').should('not.exist')
    cy.contains('Envoyer').click()
    cy.get('.fr-alert').should('contain', 'Votre demande a été prise en compte. Vous recevrez un courriel pour modifier votre mot de passe.')
  })
})
