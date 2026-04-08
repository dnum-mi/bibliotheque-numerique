import type { RouteRecordRaw } from 'vue-router'

import { routeNames } from '@/router/route-names'
import { isNotAuthenticatedGuard } from '@/shared/guards'

export const passwordRoutes: RouteRecordRaw[] = [
  {
    path: '/update-password/:token',
    name: routeNames.UPDATE_PASSWORD,
    beforeEnter: [isNotAuthenticatedGuard],
    component: () => import('@/views/passwords/UpdatePassword.vue'),
    props: true,
    meta: {
      title: 'Mise à jour du mot de passe',
      skipAuth: true,
    },
  },
  {
    path: '/reset-password',
    name: routeNames.RESET_PASSWORD,
    beforeEnter: [isNotAuthenticatedGuard],
    component: () => import('@/views/passwords/ResetPassword.vue'),
    meta: {
      title: 'Réinitialisation du mot de passe',
      skipAuth: true,
    },
  },
]
