import '@gouvminint/vue-dsfr/styles'
import '../main.css'

import { getChamps } from './__tests__/dossiers'

import DossierChamps from './DossierChamps.vue'

describe('<DossierChamps />', () => {
  it('renders', () => {
    const datas = getChamps()
    cy.mount(DossierChamps, { props: { datas } })

    cy.get('label').then(($label) => {
      datas.forEach(({ label, stringValue }, idx) => {
        cy.wrap($label).eq(idx).contains(new RegExp(`^${label} :$`, 'g')).next().should('contain', stringValue)
      })
    })
  })
})
