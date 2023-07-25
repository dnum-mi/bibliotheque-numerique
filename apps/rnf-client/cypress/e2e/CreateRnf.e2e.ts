describe('RNF creation form', () => {
  let collisionObject = {};
  let collisionResponse = {};
  let reponseCreated = {};
  before(() => {
    cy.fixture('foundation').then(collision => {
      collisionObject = collision
      collisionResponse = {
        "statusCode": 409,
        "message": "Foundations have been found",
        "data": {
          collisionFoundations : Array.from({ length: 8 }).map((elt, idx) => ({
                ...collisionObject,
                "rnfId": `095-FDD-000002-0${idx}`,
              })),
            currentFoundation: {
              ...collisionObject,
            },
            },
        "path": "/api/foundation",
      }

    })
    cy.fixture('createDossier113').then(response => {
      reponseCreated=response
    })

  })

  it('Should print an error if dossier doesnt exist', () => {
    cy.visit('/')

    cy.intercept({ url: '/api/foundation', method: 'POST' }).as('createRnf')

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

    cy.intercept({ url: '/api/foundation', method: 'POST' }).as('createRnf')

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

  it('Should create an RNF id', () => {
    cy.visit('/')

    if(Cypress.env("WITH_MOCK_API")) {
      cy.fixture('createDossier113').then(response => {
        cy.intercept({ url: '/api/foundation', method: 'POST' },req => {
          req.reply({ body: response, statusCode: 201, headers: { 'Content-Type': 'application/json' }})
        }).as('createRnf')
      })
    } else {
      cy.intercept({ url: '/api/foundation', method: 'POST' }).as('createRnf')
    }

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

    cy.url() //
      .should('include', '/result')
    cy.get('h2').should('contain', ' a été créé, et ajouté en annotation privée.')
    cy.get('h2').should('contain', '059-FDD-00')
  })

  const shouldDisplaySimilarFoundations = () => {
    cy.visit('/')

    if(Cypress.env("WITH_MOCK_API")) {
      cy.intercept({ url: '/api/foundation', method: 'POST' }, req => {
        const { forceCreate } = req.body
        if(forceCreate) {
          return req.reply({ body: reponseCreated, statusCode: 201, headers: { 'Content-Type': 'application/json' }})
        }
        req.reply({ body: collisionResponse, statusCode: 409, headers: { 'Content-Type': 'application/json' }})
      }).as('createRnf')
    } else {
      cy.intercept({ url: '/api/foundation', method: 'POST' }).as('createRnf')
    }

    cy.get('.rnf-request').find('input[type=text]').type('113')

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

    cy.get("footer").should('contain', 'Aucune structure ne correspond')
    cy.get("button").should('contain', 'Créer un ID RNF')
  }

  it('Should display similar foundation', () => {
    shouldDisplaySimilarFoundations()
    cy.get('.fr-radio-group').eq(0).click()

    cy.get("footer").should('contain', 'Une structure RNF a déjà été créée')
    cy.get("button").should('contain', 'Rejeter la demande')

    cy.get('h6').contains('Demande d’inscription au RNF').click()

    cy.get("footer").should('contain', 'Aucune structure ne correspond')
    cy.get("button").should('contain', 'Créer un ID RNF')
  })


  it('Should create an RNF id if there are similar foundations', () => {
    shouldDisplaySimilarFoundations()

    cy.get('[data-testid="create-btn"]') //
    .click()
    cy.wait('@createRnf', { timeout: 10000 }) //
    .its('response')
    .should('have.property', 'statusCode', 201)

    cy.url() //
      .should('include', '/result')
    cy.get('h2').should('contain', ' a été créé, et ajouté en annotation privée.')

  })

  it('Should reject an RNF id existed', () => {
    shouldDisplaySimilarFoundations()
    cy.get('.fr-radio-group').eq(0).click()

    cy.get('[data-testid="create-btn"]') //
    .click()

    cy.url() //
      .should('include', '/result')
    cy.get('h2').should('contain', 'Retournez dans Démarches Simplifiées pour refuser le dossier')

  })

})
