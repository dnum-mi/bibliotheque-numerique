import '@gouvminint/vue-dsfr/styles'
import '../main.css'

import BiblioNumDataTable from './BiblioNumDataTableAgGrid.vue'

describe('<BiblioNumDataTable />', () => {
  it('renders', () => {
    cy.mount(BiblioNumDataTable, {
      props: {
        title: 'Test',
        rowData: [{
          testkey: 'testValue',
        }],
        headers: [{
          text: 'Test-Key',
          value: 'testkey',
        }],
      },
    })
  })
})
