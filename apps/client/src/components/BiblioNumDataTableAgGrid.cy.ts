import '@gouvminint/vue-dsfr/styles'
import VueDsfr from '@gouvminint/vue-dsfr'

import '../main.css'
import * as icons from '../icons'

import { getDateISO } from '../utils/__tests__/fake-data'
import { dateToStringFr } from '@/utils/date-to-string'
import { getFileObjectExample } from '../__test__/ds-type'
import { agGridFilterDict } from '@/shared/types'

import BiblioNumDataTable from './BiblioNumDataTableAgGrid.vue'

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
        withAction: true,
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

  it('render to header with attachment', () => {
    const headers = [
      {
        value: 'id',
      },
      {
        text: 'Test-Key',
        value: 'testkey',
        type: agGridFilterDict.FILE,
      },
      {
        text: 'Test-Key1',
        value: 'testkey1',
        type: agGridFilterDict.TEXT,
      },

    ]

    const datas = [
      {
        id: 'test-id-1',
        testkey: getFileObjectExample(),
      },
      {
        id: 2,
        testkey: {

        },
      },
    ]

    const extensions = {
      use: [
        {
          install: (app) => {
            app.use(
              VueDsfr,
              { icons: Object.values(icons) },
            )
          },
        },
      ],
    }

    cy.mount(BiblioNumDataTable, {
      extensions,
      props: {
        title: 'Test',
        rowData: datas,
        headers,
        floatingFilter: 'true',
      },
    })
    cy.get('.ag-header-cell').should('contain', 'Test-Key')

    datas.forEach((data, index) => {
      const row = `row${index}`
      cy.get('.ag-cell')
        .should('contain', data.id)
        .contains(data.id)
        .parent().as(row)
      if (data.testkey.uuid) {
        cy.get(`@${row}`)
          .get('a')
          .should('have.attr', 'href', `/api/files/${data.testkey?.uuid}`)
        return
      }
      cy.get(`@${row}`).within(() => {
        cy.get('a')
          .should('not.exist')
      })
    })
  })
})
