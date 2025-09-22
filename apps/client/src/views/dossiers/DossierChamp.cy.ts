import '@gouvminint/vue-dsfr/styles'
import '@/main.css'

import { getFields } from '@/views/__tests__/dossiers'

import DossierChamp from './DossierChamp.vue'

describe('<DossierChamp />', () => {
  it('renders', () => {
    const champ = getFields()[0].items[0]
    cy.mount(DossierChamp, { props: { champ } })

    cy.get('label').then(($label) => {
      if ('value' in champ) {
        cy.wrap($label).next().should('contain', champ.value)
      }
    })
  })
})
