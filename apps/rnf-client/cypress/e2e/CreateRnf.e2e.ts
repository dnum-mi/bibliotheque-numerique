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

  it('Should reset the form', () => {
    cy.visit('/')

    cy.get('.rnf-request').find('input[type=text]').type('17')

    cy.get('.rnf-request') //
      .find('input[type=email]')
      .type('nonexisting@interieur.gouv.fr')

    cy.get('[data-testid="reset-btn"]') //
      .click()

    cy.get('.rnf-request') //
      .find('input[type=email]')
      .should('have.value', '')

    cy.get('.fr-messages-group').should('not.exist')

    cy.get('.rnf-request') //
      .find('input[type=email]')
      .type('nonexisting@interieur')

    cy.get('.rnf-request') //
      .find('input[type=email]')
      .blur()

    cy.get('.fr-messages-group').should('contain', 'pas valide')

    cy.get('[data-testid="reset-btn"]') //
      .click()
    cy.get('.fr-messages-group').should('not.exist')
  })

  const collisionResponse = {
    "statusCode": 409,
    "message": "Foundations have been found",
    "data": {
      collisionFoundations : Array.from({ length: 8 }).map((elt, idx) => ({
            "id": 2,
            "createdAt": "2023-06-27T13:53:36.147Z",
            "updatedAt": "2023-06-27T13:53:36.147Z",
            "rnfId": `095-FDD-000002-04-${idx}`,
            "type": "FDD",
            "department": "95",
            "title": "test de fondation",
            "addressId": 2,
            "phone": "+33612345678",
            "email": "baudoin.tran@interieur.gouv.fr",
            "address": {
                "id": 2,
                "createdAt": "2023-06-27T13:53:36.147Z",
                "updatedAt": "2023-06-27T13:53:36.147Z",
                "label": "1 Place du Coeur Battant 95490 Vauréal",
                "type": "housenumber",
                "streetAddress": "1 Place du Coeur Battant",
                "streetNumber": "1",
                "streetName": "Place du Coeur Battant",
                "postalCode": "95490",
                "cityName": "Vauréal",
                "cityCode": "95637",
                "departmentName": "Val-d'Oise",
                "departmentCode": "95",
                "regionName": "Île-de-France",
                "regionCode": "11",
            },
          })),
        currentFoundation: {
          "type": "FDD",
          "department": "95",
          "title": "test de fondation",
          "addressId": 2,
          "phone": "+33612345678",
          "email": "baudoin.tran@interieur.gouv.fr",
          "address": {
              "id": 2,
              "createdAt": "2023-06-27T13:53:36.147Z",
              "updatedAt": "2023-06-27T13:53:36.147Z",
              "label": "1 Place du Coeur Battant 95490 Vauréal",
              "type": "housenumber",
              "streetAddress": "1 Place du Coeur Battant",
              "streetNumber": "1",
              "streetName": "Place du Coeur Battant",
              "postalCode": "95490",
              "cityName": "Vauréal",
              "cityCode": "95637",
              "departmentName": "Val-d'Oise",
              "departmentCode": "95",
              "regionName": "Île-de-France",
              "regionCode": "11",
          }},
        },
    "path": "/api/foundation",
  }

  it.only('Should display similar foundation', () => {
    cy.visit('/')

    cy.intercept({ url: '/api/rnf/foundation', method: 'POST' }, req => {
      req.reply({ body: collisionResponse, statusCode: 409, headers: { 'Content-Type': 'application/json' }})
    }).as('createRnf')

    cy.get('.rnf-request').find('input[type=text]').type('17')

    cy.get('.rnf-request') //
      .find('input[type=email]')
      .type('dev@pulsarr.fr')

    cy.get('.rnf-request') //
      .find('input[type=email]')
      .type('{ENTER}')

    cy.wait('@createRnf', { timeout: 10000 }) //
      .its('response')
      .should('have.property', 'statusCode', 409)

    cy.get('.fr-alert').should('not.exist')
    cy.get('.collision').should('exist')
    cy.get('.fr-card').should('exist')
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
