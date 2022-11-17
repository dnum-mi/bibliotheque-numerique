import '@gouvminint/vue-dsfr/styles'
import '../main.css'

import { getChamps } from './__tests__/dossiers'

import DossierChamps from './DossierChamps.vue'

describe('<DossierChamps />', () => {
  it('renders', () => {
    const datas = getChamps()
    console.log(JSON.stringify(datas))
    cy.mount(DossierChamps, { props: { datas } })

    cy.get('label').then(($label) => {
      datas.forEach(({ label, stringValue }) => {
        cy.wrap($label).contains(label).next().should('contain', stringValue)
      })
    })
  })
})
