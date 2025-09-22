import '@gouvminint/vue-dsfr/styles'
import '@/main.css'

import { getFields } from '@/views/__tests__/dossiers'

import DossierChamps from './DossierChamps.vue'

describe('<DossierChamps />', () => {
  it('renders', () => {
    const champs = getFields()[0].items
    cy.mount(DossierChamps, { props: { champs } })

    cy.get('label').then(($label) => {
      champs.forEach((champ, idx) => {
        if ('value' in champ) {
          cy.wrap($label).eq(idx).next().should('contain', champ.value)
        }
      })
    })
  })
})
