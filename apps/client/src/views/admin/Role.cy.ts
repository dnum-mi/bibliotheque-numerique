import { createMemoryHistory, createRouter } from 'vue-router'

import Role from './Role.vue'

import { createRandomAdmin } from '@/views/__tests__/users'
import { createRandomRoles } from '@/views/__tests__/roles'
import apiClient from '@/api/api-client'

describe('<Role />', () => {
  it('renders', () => {
    const admin = createRandomAdmin()
    // Prevent api calls
    cy.stub(apiClient, 'loginUser').returns(Promise.resolve(admin))
    cy.stub(apiClient, 'fetchCurrentUser').returns(Promise.resolve(admin))

    const roles = createRandomRoles(10)
    const { id } = roles[0]
    cy.stub(apiClient, 'getRoleById').withArgs(id).returns(Promise.resolve(roles[0]))
    cy.stub(apiClient, 'getRoles').returns(Promise.resolve(roles))

    cy.mountWithPinia(Role, { props: { id } })
    cy.get('[data-cy=permissions-role-list]').find('[type="checkbox"]').should('have.length', 2)
  })
})
