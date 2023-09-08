import '@gouvminint/vue-dsfr/styles'
import '@/main.css'
import * as icons from '@/icons'

import VueDsfr from '@gouvminint/vue-dsfr'

import { createPinia } from 'pinia'
import Admin from './Admin.vue'

import { createRandomAdmin, createRandomUsers, createRandomUserWithCreateRole, createRandomUserWithoutCreateRole } from '@/views/__tests__/users'
import { createRandomRoles } from '@/views/__tests__/roles'
import { useRoleStore, useUserStore } from '@/stores'
import type { User } from '@/shared/interfaces'

describe('<Admin />', () => {
  it('Should render because admin', () => {
    const pinia = createPinia()
    const userStore = useUserStore(pinia)
    const roleStore = useRoleStore(pinia)
    const adminUser = createRandomAdmin()
    const users: User[] = createRandomUsers(10)
    userStore.currentUser = adminUser
    userStore.users = new Map(users.map(user => [user.id, user]))
    roleStore.roles = createRandomRoles(10)

    userStore.loadUsers = () => Promise.resolve()
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
    cy.mount(Admin, {
      extensions,
    })

    cy.get('h2.mb-10').should('contain', 'Espace administration')
    cy.get('[data-cy=user-list] [data-cy=cell-action-icon]').should('have.length', 10)
    cy.get('[data-cy=role-list] [data-cy=cell-action-icon]').should('have.length', 10)
  })
  it('Should render because user without create role', () => {
    const pinia = createPinia()
    const userStore = useUserStore(pinia)
    const roleStore = useRoleStore(pinia)
    const adminUser = createRandomUserWithoutCreateRole()
    const users: User[] = createRandomUsers(10)
    userStore.currentUser = adminUser
    userStore.users = new Map(users.map(user => [user.id, user]))
    roleStore.roles = createRandomRoles(10)

    userStore.loadUsers = () => Promise.resolve()
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
    cy.mount(Admin, {
      extensions,
    })

    cy.get('h2.mb-10').should('contain', 'Espace administration')
    cy.get('[data-cy=user-list] [data-cy=cell-action-icon]').should('have.length', 10)
    cy.get('[data-cy=role-list]').should('not.exist')
  })

  it('Should render because user with create role', () => {
    const pinia = createPinia()
    const userStore = useUserStore(pinia)
    const roleStore = useRoleStore(pinia)
    const adminUser = createRandomUserWithCreateRole()
    const users: User[] = createRandomUsers(10)
    userStore.currentUser = adminUser
    userStore.users = new Map(users.map(user => [user.id, user]))
    roleStore.roles = createRandomRoles(10)

    userStore.loadUsers = () => Promise.resolve()
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
    cy.mount(Admin, {
      extensions,
    })

    cy.get('h2.mb-10').should('contain', 'Espace administration')
    cy.get('[data-cy=user-list] [data-cy=cell-action-icon]').should('have.length', 10)
    cy.get('[data-cy=role-list]').should('exist')
  })
})
