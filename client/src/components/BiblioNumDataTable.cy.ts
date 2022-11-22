import '@gouvminint/vue-dsfr/styles'
import '../main.css'
import * as icons from '../icons'

import VueDsfr from '@gouvminint/vue-dsfr'

import BiblioNumDataTable from './BiblioNumDataTable.vue'

describe('<BiblioNumDataTable />', () => {
  it('renders', () => {
    const extensions = {
      use: [
        VueDsfr,
        { icons: Object.values(icons) },
      ],
    }

    cy.mount(BiblioNumDataTable, {
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
