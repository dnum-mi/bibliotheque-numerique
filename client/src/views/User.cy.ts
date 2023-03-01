import '@gouvminint/vue-dsfr/styles'
import '../main.css'
import * as icons from '../icons'

import VueDsfr from '@gouvminint/vue-dsfr'

import { createPinia } from 'pinia'
import User from './User.vue'

import { createRandomAdmin, createRandomUser } from './__tests__/users'
import { createRandomRoles } from '@/views/__tests__/roles'
import { useRoleStore, useUserStore } from '@/stores'

describe('<User />', () => {
  it('Should render because admin', () => {
    const pinia = createPinia()

    const userStore = useUserStore(pinia)
    const roleStore = useRoleStore(pinia)

    userStore.currentUser = createRandomAdmin()
    userStore.users = new Map()
    roleStore.roles = createRandomRoles(10)

    userStore.loadUserById = (id: number) => {
      userStore.users.set(id, { ...createRandomUser(), id })
      return Promise.resolve()
    }
    roleStore.fetchRoles = () => Promise.resolve()

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
    cy.mount(User, {
      extensions,
    })

    cy.get('h2.mb-20').should('contain', 'Utilisateur')
    cy.get('[data-cy=user-role-list] [data-cy=cell-action-icon]').should('have.length', 10)
  })
})
