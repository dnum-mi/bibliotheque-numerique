import Logout from './Logout.vue'

import { createPinia } from 'pinia'
import { useUserStore } from '@/stores'
import { createRandomUser } from '../__tests__/users'

describe('<Logout />', () => {
  it('renders', () => {
    const pinia = createPinia()
    const useStore = useUserStore(pinia)
    const newUser = createRandomUser()
    useStore.currentUser = newUser
    const extensions = {
      use: [pinia],
    }
    cy.mount(Logout, {
      extensions,
    })

    cy.intercept('DELETE', '/auth*', {
      statusCode: 201,
      body: {},
    })

    // TODO: check useStore.currentUser is null
    // cy.wait(1000)
    // cy.log(JSON.stringify(useStore.currentUser))
    // expect(useStore.currentUser).eq(null)

    // cy.window()
    //   .its('user.currentUser')
    //   .should('equal', null)
  })
})
