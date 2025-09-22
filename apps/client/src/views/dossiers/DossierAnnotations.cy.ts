import '@gouvminint/vue-dsfr/styles'
import '@/main.css'

import DossierAnnotations from './DossierAnnotations.vue'
import { generateDossierWithFields } from '@/views/__tests__/dossiers'
import type { IFieldSimple } from '@biblio-num/shared'

describe('<DossierAnnotations />', () => {
  it('renders', () => {
    const datas = generateDossierWithFields()

    cy.mount(DossierAnnotations, { props: { annotations: datas.annotations } })

    cy.get('label').then(($label) => {
      datas.annotations!.forEach(({ items }, idx) => {
        cy.wrap($label).eq(idx).next().should('contain', (items[0] as IFieldSimple).value)
      })
    })
  })
})
