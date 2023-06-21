describe('Home', () => {
  it('Should have the right title', () => {
    cy.visit('/').get('.fr-header__service').should('contain', 'RNF')
  })

  it('Should spawn on createRnf formulaire', () => {
    cy.visit('/') //
      .get('form.rnf-request')
  })
})
