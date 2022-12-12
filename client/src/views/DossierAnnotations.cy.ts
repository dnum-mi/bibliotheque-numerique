import '@gouvminint/vue-dsfr/styles'
import '../main.css'
import VueDsfr from '@gouvminint/vue-dsfr'

import DossierAnnotations from './DossierAnnotations.vue'
import { generateDossierDS } from './__tests__/dossiers'

describe('<DossierAnnotations />', () => {
  it('renders', () => {
    const extensions = {
      use: [
        VueDsfr,
      ],
    }

    const datas = generateDossierDS()

    cy.mount(DossierAnnotations, { extensions, props: { datas } })

    cy.get('label').then(($label) => {
      datas.annotations.forEach(({ label, stringValue }, idx) => {
        cy.wrap($label).eq(idx).contains(new RegExp(`^${label} :$`, 'g')).next().should('contain', stringValue)
      })
    })
  })
})
