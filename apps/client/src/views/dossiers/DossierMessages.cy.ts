import '@gouvminint/vue-dsfr/styles'
import '@/main.css'
import VueDsfr from '@gouvminint/vue-dsfr'

import DossierMessages from './DossierMessages.vue'

import { generateDossierDS } from '@/views/__tests__/dossiers'

describe('<DossierMessages />', () => {
  it('renders', () => {
    const extensions = {
      use: [
        VueDsfr,
      ],
    }

    const datas = generateDossierDS()

    cy.mount(DossierMessages, { extensions, props: { datas } })
    const messages = datas.messages
    cy.get('[data-cy=dossier-message]').should('have.length', messages.length)
  })
})
