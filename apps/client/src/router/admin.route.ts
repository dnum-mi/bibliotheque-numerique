import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

import { routeNames } from '@/router/route-names'
import { Roles } from '@biblio-num/shared-utils'
import { useUserStore } from '@/stores'

export const adminRoute = {
  name: routeNames.ADMIN,
  path: '/admin',
  component: () => import('@/views/admin/Admin.vue'),
  meta: {
    roleLevel: Roles.admin,
  },
  children: [
    {
      name: routeNames.LIST_USERS,
      path: '',
      component: () => import('@/views/admin/ListUsers.vue'),
    },
    {
      name: routeNames.USER,
      path: 'user/:id',
      component: () => import('@/views/admin/one-user/User.vue'),
      beforeEnter: async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
        try {
          await useUserStore().loadUserById(parseInt(to.params.id as string))
        } catch (e) {
          next({ name: routeNames.Page_404 })
        }
        if (!useUserStore().selectedEditableUser) {
          next({ name: routeNames.Page_404 })
        }
        next(true)
      },
      props: () => ({ selectedEditableUser: useUserStore().selectedEditableUser }),
    },

  ],
}
