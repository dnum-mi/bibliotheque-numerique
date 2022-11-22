import '@gouvminint/vue-dsfr/styles'
import '../main.css'

import BliblioNumDataTable from './BliblioNumDataTableAgGrid.vue'

describe('<BliblioNumDataTable />', () => {
  it('renders', () => {
    cy.mount(BliblioNumDataTable, {
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
