import '@gouvminint/vue-dsfr/styles'
import '../main.css'
import * as icons from '../icons'

import VueDsfr from '@gouvminint/vue-dsfr'

import BiblioNumDataTable from './BiblioNumDataTableAgGrid.vue'
import { getDateISO } from '../utils/__tests__/fake-data'
import { dateToStringFr } from '@/utils/dateToString'
import { getFileObjectExample } from '../__test__/ds-type'
import { ETypeFilter } from '../shared/types/typeDataTable'

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
        type: ETypeFilter.FILE,
      },
      {
        text: 'Test-Key1',
        value: 'testkey1',
        type: ETypeFilter.TEXT,
      },

    ]

    const datas = [
      {
        id: 'test-id-1',
        testkey: getFileObjectExample(),
      },
      {
        id: 2,
        testkey: {},
      },
      // {
      //   id: 2,
      //   testkey: undefined,
      // },

    ]

    const extensions = {
      use: [
        {
          install: (app) => {
            app.use(VueDsfr,
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

    datas.forEach(data => {
      // eslint-disable-next-line cypress/no-assigning-return-values
      const row = cy.get('.ag-cell')
        .should('contain', data.id)
        .contains(data.id)
        .parent()
        .children()
      if (data.testkey?.url) {
        row
          .find('a')
          .should('have.attr', 'href', data.testkey?.url)
        return
      }
      row
        .find('a')
        .should('not.have.attr', 'href')
    })
  })
})
