describe('RNF creation form', () => {
  it('Should print an error if dossier doesnt exist', () => {
    cy.visit('/')

    cy.intercept({ url: '/api/rnf/foundation', method: 'POST' }).as('createRnf')

    cy.get('.rnf-request').find('input[type=text]').type('12')

    cy.get('.rnf-request') //
      .find('input[type=email]')
      .type('nonexisting@interieur.gouv.fr')

    cy.get('.rnf-request') //
      .find('input[type=email]')
      .type('{ENTER}')

    cy.wait('@createRnf', { timeout: 10000 }) //
      .its('response')
      .should('have.property', 'statusCode', 424)

    cy.get('.fr-alert').should('contain', 'semble pas exister')
  })

  it('Should print an error if email is not authorized', () => {
    cy.visit('/')

    cy.intercept({ url: '/api/rnf/foundation', method: 'POST' }).as('createRnf')

    cy.get('.rnf-request').find('input[type=text]').type('17')

    cy.get('.rnf-request') //
      .find('input[type=email]')
      .type('nonexisting@interieur.gouv.fr')

    cy.get('.rnf-request') //
      .find('input[type=email]')
      .type('{ENTER}')

    cy.wait('@createRnf', { timeout: 10000 }) //
      .its('response')
      .should('have.property', 'statusCode', 403)

    cy.get('.fr-alert').should('contain', 'ne semble pas être l\'email')
  })

  it('Should create an RNF id', () => {
    cy.visit('/')

    cy.intercept({ url: '/api/rnf/foundation', method: 'POST' }).as('createRnf')

    cy.get('.rnf-request').find('input[type=text]').type('113')

    cy.get('.rnf-request') //
      .find('input[type=email]')
      .type('dev@pulsarr.fr')

    cy.get('.rnf-request') //
      .find('input[type=email]')
      .type('{ENTER}')

    cy.wait('@createRnf', { timeout: 10000 }) //
      .its('response')
      .should('have.property', 'statusCode', 201)

    cy.get('.fr-alert').should('contain', '059-FDD-00')
  })
})
