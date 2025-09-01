import '@gouvfr/dsfr/dist/dsfr.min.css'
import '@gouvminint/vue-dsfr/styles'
import '@/main.css'

import FicheOrganisme from './FicheOrganisme.vue'
import { generateOrganisme } from '../../__tests__/dossiers'
import {
  useOrganismeStore,
  //  useUserStore
} from '../../../stores'

describe.skip('<FicheOrganisme />', () => {
  it('renders', () => {
    const organismeStore = useOrganismeStore()
    // const userStore = useUserStore()
    organismeStore.organisme = generateOrganisme()

    cy.mountWithPinia(FicheOrganisme)

    // TODO: Erreur de visuel à cause de DsfrTabContent dont la valeur de left est -100%
  })
})
