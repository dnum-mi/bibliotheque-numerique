import '@gouvminint/vue-dsfr/styles'
import '@/main.css'
import VueDsfr from '@gouvminint/vue-dsfr'

import DossierAnnotations from './DossierAnnotations.vue'
import { generateDossierDS } from '@/views/__tests__/dossiers'

describe('<DossierAnnotations />', () => {
  it('renders', () => {
    const datas = generateDossierDS()

    cy.mount(DossierAnnotations, { props: { annotations: datas.annotations } })

    cy.get('label').then(($label) => {
      datas.annotations.forEach(({ label, stringValue }, idx) => {
        cy.wrap($label).eq(idx).next().should('contain', stringValue)
      })
    })
  })
})
