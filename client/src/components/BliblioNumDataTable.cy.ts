import '@gouvminint/vue-dsfr/styles'
import '../main.css'
import * as icons from '../icons'

import VueDsfr from '@gouvminint/vue-dsfr'

import BliblioNumDataTable from './BliblioNumDataTable.vue'

describe('<BliblioNumDataTable />', () => {
  it('renders', () => {
    const extensions = {
      use: [
        VueDsfr,
        { icons: Object.values(icons) },
      ],
    }

    cy.mount(BliblioNumDataTable, {
      extensions,
      props: {
        title: 'Test',
        datas: [{
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
