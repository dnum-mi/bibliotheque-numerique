import '@gouvminint/vue-dsfr/styles'
import '@/main.css'

import { generateDossierWithFields } from '@/views/__tests__/dossiers'

import DossierDemande from './DossierDemande.vue'
import { isPersonneMorale } from '@/utils/helperDemandeur'
import type { PersonneMorale, PersonnePhysique } from '@dnum-mi/ds-api-client'

describe('<DossierDemande />', () => {
  it('renders', () => {
    const datas = generateDossierWithFields()

    cy.mount(DossierDemande, { props: { datas } })
    // TODO: A completer
    // Test demandeur
    cy.get('h2').should('contain', 'Identité du déclarant')
    if (isPersonneMorale(datas.demandeur!.__typename!)) {
      cy.get('label').contains('Siret').next().should('contain', (datas.demandeur as PersonneMorale)?.siret)
    } else {
      cy.get('label').contains('Civilité').next().should('contain', (datas.demandeur as PersonnePhysique)?.civilite?.toUpperCase())
    }
  })
})
