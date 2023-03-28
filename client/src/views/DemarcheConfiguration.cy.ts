import { createPinia } from 'pinia'
import VueDsfr from '@gouvminint/vue-dsfr'
import * as icons from '@/icons'
import { useDemarcheStore } from '@/stores'
import { generateDemarche } from '@/views/__tests__/demarches'
import DemarcheConfiguration from './DemarcheConfiguration.vue'

describe('<DemarcheConfiguration />', () => {
  it('renders', () => {
    const pinia = createPinia()
    const useStore = useDemarcheStore(pinia)
    const demarche = generateDemarche()
    useStore.demarche = demarche
    useStore.getDemarche = async (id: number) => {
      useStore.demarche = demarche
    }
    const extensions = {
      use: [
        pinia,
        {
          install: (app) => {
            app.use(VueDsfr,
              { icons: Object.values(icons) },
            )
          },
        },
      ],
    }

    const demarcheMappingColonnes = [
      {
        display: true,
        id: 'Q2hhbXAtMTE5',
        labelBN: 'test label BN',
        labelSource: ['Déclaration initiale de création'],
        typeData: 'champ',
        typeName: 'header_section',
        typeValue: 'number',
      },
      {
        display: true,
        id: 'Q2hhbXAtMTIw',
        labelBN: '',
        labelSource: ['Autorité ayant délivré le récépissé de déclaration de création du fonds de dotation'],
        typeData: 'champ',
        typeName: 'departements',
        typeValue: '',
      },
    ]

    cy.mount(DemarcheConfiguration, { extensions, props: { datas: demarcheMappingColonnes } })

    cy.get('#id-Q2hhbXAtMTE5').should('have.value', 'Q2hhbXAtMTE5')
    cy.get('#typeData-Q2hhbXAtMTE5').should('have.value', 'champ')
    cy.get('#typeName-Q2hhbXAtMTE5').should('have.value', 'header_section')
    cy.get('#labelSource-Q2hhbXAtMTE5').should('have.value', 'Déclaration initiale de création')
    cy.get('#labelBN-Q2hhbXAtMTE5').should('have.value', 'test label BN')

    cy.get('#id-Q2hhbXAtMTIw').should('have.value', 'Q2hhbXAtMTIw')
    cy.get('#labelSource-Q2hhbXAtMTIw').should('have.value', 'Autorité ayant délivré le récépissé de déclaration de création du fonds de dotation')
    cy.get('#labelBN-Q2hhbXAtMTIw').should('have.value', '')
    cy.get('#typeData-Q2hhbXAtMTIw').should('have.value', 'champ')
    cy.get('#typeName-Q2hhbXAtMTIw').should('have.value', 'departements')
  })
})
