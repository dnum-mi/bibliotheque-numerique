import ReloadPrompt from './ReloadPrompt.vue'

describe('ReloadPrompt', () => {
  it('should render ReloadPrompt with offline ready button', () => {
    cy.mountWithPinia(ReloadPrompt, {
      props: {
        offlineReady: true,
      },
    })

    cy.get('button')
      .should('contain', 'Fermer')
  })
  it('should render ReloadPrompt with refresh button', () => {
    cy.mountWithPinia(ReloadPrompt, {
      props: {
        needRefresh: true,
      },
    })

    cy.get('button:nth-child(1)')
      .should('contain', 'Recharger')
      .should('not.have.class', 'fr-btn--secondary')
    cy.get('button:nth-child(2)')
      .should('contain', 'Fermer')
      .should('have.class', 'fr-btn--secondary')
  })
})
