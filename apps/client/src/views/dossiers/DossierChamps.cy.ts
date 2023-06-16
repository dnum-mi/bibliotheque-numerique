import '@gouvminint/vue-dsfr/styles'
import '@/main.css'

import { getChamps } from '@/views/__tests__/dossiers'

import DossierChamps from './DossierChamps.vue'

describe('<DossierChamps />', () => {
  it('renders', () => {
    const champs = getChamps()
    cy.mount(DossierChamps, { props: { champs } })

    cy.get('label').then(($label) => {
      champs.forEach(({ label, stringValue }, idx) => {
        cy.wrap($label).eq(idx).next().should('contain', stringValue)
      })
    })
  })
})
