import { useUserStore } from '@/stores'
import { createRandomAdmin } from './__tests__/users'

import Profile from './Profile.vue'
import { createPinia } from 'pinia'
import { ASK_RESET_PWD_SUCCESS } from '../messages'

describe('<Profile />', () => {
  it('renders', () => {
    cy.intercept('/api/users/reset-password', { success: true })

    const pinia = createPinia()
    const useStore = useUserStore(pinia)
    const newUser = createRandomAdmin()
    useStore.currentUser = newUser
    const userRols = newUser.roles

    cy.mount(Profile, { stores: pinia })
    cy.contains(newUser.email)
    cy.contains('La liste des vos rôles')
    cy.contains(userRols[0].name)
    cy.contains(userRols[0].description)

    cy.contains('Modifier mon mot de passe').click()
    cy.get('.fr-alert').should('contain', ASK_RESET_PWD_SUCCESS)
  })
})
