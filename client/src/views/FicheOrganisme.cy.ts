import '@gouvminint/vue-dsfr/styles'
import '../main.css'
import * as icons from '../icons'

import VueDsfr from '@gouvminint/vue-dsfr'
import { createPinia } from 'pinia'

import FicheOrganisme from './FicheOrganisme.vue'

describe('<FicheOrganisme />', () => {
  it('renders', () => {
    const pinia = createPinia()
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

    // see: https://on.cypress.io/mounting-vue
    cy.mount(FicheOrganisme, {
      extensions,
    })
  })
})
