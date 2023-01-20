import '@gouvminint/vue-dsfr/styles'
import '../main.css'

import VueDsfr from '@gouvminint/vue-dsfr'

import { createPinia } from 'pinia'
import { useUserStore } from '@/stores'
import { createRandomUser } from './__tests__/users'

import Profile from './Profile.vue'

describe('<Profile />', () => {
  it('renders', () => {
    const pinia = createPinia()
    const useStore = useUserStore(pinia)
    const newUser = createRandomUser()
    useStore.currentUser = newUser
    const extensions = {
      use: [
        pinia,
        VueDsfr,
      ],
    }
    cy.mount(Profile, {
      extensions,
    })
    cy.contains(newUser.email)
    cy.contains(newUser.id)
  })
})
