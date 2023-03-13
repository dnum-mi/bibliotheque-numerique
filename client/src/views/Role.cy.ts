import '@gouvminint/vue-dsfr/styles'
import '../main.css'
import * as icons from '../icons'

import VueDsfr from '@gouvminint/vue-dsfr'

import { createPinia } from 'pinia'
import { useRoleStore } from '@/stores'

import Role from './Role.vue'

import { createRandomRoles, getPermissionNumber } from './__tests__/roles'
import { createMemoryHistory, createRouter } from 'vue-router'

describe('<Role />', () => {
  it('renders', () => {
    const pinia = createPinia()
    const roleStore = useRoleStore(pinia)
    roleStore.roles = createRandomRoles(10)
    roleStore.fetchRoles = () => Promise.resolve()
    roleStore.fetchRoleById = () => Promise.resolve()
    const router = createRouter({
      routes: [
        {
          path: '/role/:id',
          name: 'Role',
          component: () => import('@/views/Role.vue'),
        }],
      history: createMemoryHistory(),
    })

    const { id } = [...roleStore.roles.values()][0]
    const extensions = {
      use: [
        pinia,
        {
          install: (app) => {
            app.use(VueDsfr,
              { icons: Object.values(icons) },
            )
            app.use(router)
          },
        },
      ],
    }
    cy.wrap(router.push(`/role/${id}`))
    cy.mount(Role, {
      extensions,
    })
    cy.get('[data-cy=permissions-role-list]').find('li').should('have.length', getPermissionNumber())
  })
})
