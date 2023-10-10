import User from './User.vue'

import { createRandomAdmin, createRandomUser } from '@/views/__tests__/users'
import { createRandomRoles } from '@/views/__tests__/roles'
import { useUserStore } from '@/stores'
import apiClient from '@/api/api-client'

describe('<User />', () => {
  it('Should render list of user if connected as admin', () => {
    const admin = createRandomAdmin()
    // Prevent api calls
    cy.stub(apiClient, 'loginUser').returns(Promise.resolve(admin))
    cy.stub(apiClient, 'fetchCurrentUser').returns(Promise.resolve(admin))
    cy.stub(apiClient, 'getRoles').returns(Promise.resolve(createRandomRoles(10)))

    // Stub store
    const userStore = useUserStore()
    cy.stub(userStore, 'currentUser').returns(admin)
    cy.stub(userStore, 'loadUserById', async (id: number) => { userStore.users.set(id, { ...createRandomUser(), id }) })

    cy.mountWithPinia(User)

    cy.get('h2.mb-20').should('contain', 'Utilisateur')
    cy.get('[data-cy=user-role-list] [data-cy=cell-action-icon]').should('have.length', 10)
  })
})
