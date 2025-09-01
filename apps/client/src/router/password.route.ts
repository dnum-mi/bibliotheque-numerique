import type { RouteRecordRaw } from 'vue-router'

import { routeNames } from '@/router/route-names'

export const passwordRoutes: RouteRecordRaw[] = [
  {
    path: '/update-password/:token',
    name: routeNames.UPDATE_PASSWORD,
    component: () => import('@/views/passwords/UpdatePassword.vue'),
    props: true,
    meta: {
      skipAuth: true,
    },
  },
  {
    path: '/reset-password',
    name: routeNames.RESET_PASSWORD,
    component: () => import('@/views/passwords/ResetPassword.vue'),
    meta: {
      skipAuth: true,
    },
  },
]
