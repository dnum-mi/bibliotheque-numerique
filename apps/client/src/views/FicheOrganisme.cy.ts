import VueDsfr from '@gouvminint/vue-dsfr'
import '@gouvfr/dsfr/dist/dsfr.min.css'
import '@gouvminint/vue-dsfr/styles'
import '../main.css'
import * as icons from '../icons'

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

    // TODO: Erreur de visuel à cause de DsfrTabContent dont la valeur de left est -100%
  })
})
