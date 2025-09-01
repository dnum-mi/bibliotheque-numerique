import '@gouvminint/vue-dsfr/styles'
import '@/main.css'

import { getChamps } from '@/views/__tests__/dossiers'

import DossierChamp from './DossierChamp.vue'

describe('<DossierChamp />', () => {
  it('renders', () => {
    const champ = getChamps()[0]
    cy.mount(DossierChamp, { props: { champ } })

    cy.get('label').then(($label) => {
      cy.wrap($label).next().should('contain', champ.stringValue)
    })
  })
})
