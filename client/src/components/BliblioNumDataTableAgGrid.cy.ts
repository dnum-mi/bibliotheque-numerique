import '@gouvminint/vue-dsfr/styles'
import '../main.css'
import * as icons from '../icons'

import VueDsfr from '@gouvminint/vue-dsfr'

import BliblioNumDataTable from './BliblioNumDataTable.vue'

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
