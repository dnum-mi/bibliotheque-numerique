import {
  getFoundation,
  getLegalEntityTypeFondtion,
  getLegalEntityTypeAssociation,
  getLegalEntityTypeEntreprise,
  getLegalEntityTypeAutre,
} from '../utils/foundation-hub'

describe('Vue Organisme', () => {
  beforeEach(() => {
    cy.fixture('admin-profile').then((user) => {
      cy.intercept('api/users/me', user).as('me')
    })
    cy.intercept('api/health', { info: {
      version: { version: '0.0' },
      environment: { environment: 'test' },
    } }).as('health')
    cy.intercept('GET', 'api/bn-configurations/client', [])

    cy.intercept('/api/dossiers/organismes/*', {

    })
  })

  const commonIntercept = (foundation) => {
    cy.intercept('api/hub/rnf/000-XXX-00000-00', foundation).as('getHubFoundation')
    cy.intercept('api/users/me/recent-organismes', ['000-XXX-00000-00']).as('getRecentOrganisme')

    cy.intercept({
      method: 'POST',
      url: 'api/users/me/recent-organismes',
    }, {
      id: '000-XXX-00000-00',
    }).as('postRecentOrganisme')
  }

  it('vue Fiche organisme', () => {
    const foundation = getFoundation()
    foundation.id = '000-XXX-00000-00'
    commonIntercept(foundation)
    cy.visit('organismes/000-XXX-00000-00')
    cy.wait('@me')
    cy.wait('@health')
    cy.wait('@getHubFoundation')
    cy.wait(10000)
    // cy.wait('@postRecentOrganisme')

    cy.get('.banner-height').should('contain', '000-XXX-00000-00')
  })

  it('should find all legal entity', () => {
    const foundation = getFoundation({ nbPerson: { min: 4 } })
    foundation.id = '000-XXX-00000-00'
    foundation.persons[0].legalEntity = getLegalEntityTypeFondtion()
    foundation.persons[1].legalEntity = getLegalEntityTypeAssociation()
    foundation.persons[2].legalEntity = getLegalEntityTypeEntreprise()
    foundation.persons[3].legalEntity = getLegalEntityTypeAutre()

    commonIntercept(foundation)

    // To check entity legal
    cy.visit('http://localhost:5050/organismes/000-XXX-00000-00?tab=members')
    cy.wait('@me')
    cy.wait('@health')
    cy.wait('@getHubFoundation')

    cy.get('li')
      .should('contain', 'Carte')
      .contains('Carte')
      .click()

    cy.get('#tab-panel-members')
      .should('contain', foundation.persons[0].legalEntity.publicId)
    cy.get('#tab-panel-members')
      .should('contain', foundation.persons[1].legalEntity.publicId)
    cy.get('#tab-panel-members')
      .should('contain', foundation.persons[2].legalEntity.publicId)
    cy.get('#tab-panel-members')
      .should('contain', foundation.persons[3].legalEntity.name)
  })

  it('should find account information', () => {
    const foundation = getFoundation()
    foundation.id = '000-XXX-00000-00'
    commonIntercept(foundation)
    cy.visit('http://localhost:5050/organismes/000-XXX-00000-00?tab=description')
    cy.wait('@me')
    cy.wait('@health')
    cy.wait('@getHubFoundation')

    // Verify account years
    const cyAccountDeposits = cy.get('span')
      .should('contain', 'Dépôts de comptes')
      .contains('Dépôts de comptes')
      .parent()
      .parent()
    foundation.accountDepositYears.forEach(year => {
      cyAccountDeposits.should('contain', year)
    })
    if (foundation.isAccountLate) {
      const cyAccountMissing = cy.get('span')
        .should('contain', 'Années non déclarées')
        .contains('Années non déclarées')
        .parent()
        .parent()

      foundation.accountMissingYears.forEach(year => {
        cyAccountMissing.should('contain', year)
      })
    }
    cy.get('span')
      .should('contain', 'État du dépôt de comptes')
      .contains('État du dépôt de comptes')
      .parent()
      .parent()
      .should('contain', foundation.isAccountLate ? 'HORS DELAI' : 'OK')
  })
})
