import '@gouvminint/vue-dsfr/styles'
import '../main.css'

import VueDsfr from '@gouvminint/vue-dsfr'

import { createPinia } from 'pinia'
import { useUserStore } from '@/stores'
import { createRandomAdmin } from './__tests__/users'

import Profile from './Profile.vue'

describe('<Profile />', () => {
  it('renders', () => {
    const pinia = createPinia()
    const useStore = useUserStore(pinia)
    const newUser = createRandomAdmin()
    useStore.currentUser = newUser
    const userRols = newUser.roles
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
    cy.contains('La liste des vos rôles')
    cy.contains(userRols[0].name)
    cy.contains(userRols[0].description)
  })
})
