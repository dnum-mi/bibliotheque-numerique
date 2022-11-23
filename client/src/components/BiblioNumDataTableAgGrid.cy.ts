import '@gouvminint/vue-dsfr/styles'
import '../main.css'

import BiblioNumDataTable from './BiblioNumDataTableAgGrid.vue'
import { getDateISO } from '../utils/__tests__/fake-data'
import { dateToStringFr } from '@/utils/dateToString'

describe('<BiblioNumDataTable />', () => {
  it('renders', () => {
    const title = 'Test'
    const headers = [
      {
        value: 'id',
      },
      {
        text: 'Test-Key',
        value: 'testkey',
      },
      {
        text: 'Test-date',
        value: 'testdate',
        type: 'date',
        parseFn: dateToStringFr,
      },
    ]
    const datas = [
      {
        id: 1,
        testkey: 'testValue',
        testdate: getDateISO(),
      },
      {
        id: 2,
        testkey: 'testValue2',
      },
    ]

    cy.mount(BiblioNumDataTable, {
      props: {
        title: 'Test',
        rowData: datas,
        headers,
      },
    })

    cy.get('h4').should('contain', title)
    cy.get('.ag-header-cell').should('contain', 'Action')
    cy.get('.ag-header-cell').should('contain', 'Test-Key')
    cy.get('.ag-cell-value').should('contain', 'testValue')
    cy.get('.ag-cell-value').should('contain', 'testValue2')
    cy.get('.ag-header-cell').should('contain', 'Test-date')
    cy.get('.ag-cell-value').should('contain', dateToStringFr(datas[0].testdate))
  })
})
