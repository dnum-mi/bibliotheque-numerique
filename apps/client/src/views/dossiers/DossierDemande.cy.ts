import '@gouvminint/vue-dsfr/styles'
import '@/main.css'

import { generateDossierDS } from '@/views/__tests__/dossiers'

import DossierDemande from './DossierDemande.vue'
import { isPersonneMorale } from '@/utils/helperDemandeur'

describe('<DossierDemande />', () => {
  it('renders', () => {
    const datas = generateDossierDS()

    cy.mount(DossierDemande, { props: { datas } })
    // TODO: A completer
    // Test demandeur
    cy.get('h5').should('contain', 'Identité du déclarant')
    if (isPersonneMorale(datas.demandeur.__typename)) {
      cy.get('label').contains('Siret').next().should('contain', datas.demandeur.siret)
    } else {
      cy.get('label').contains('Civilité').next().should('contain', datas.demandeur.civilite.toUpperCase())
    }
  })
})
