import type { RouteRecordRaw } from 'vue-router'

import { routeNames } from '@/router/route-names'

export const cookiesRoute: RouteRecordRaw = {
  name: routeNames.COOKIES,
  path: '/cookies',
  component: () => import('@/views/Cookies.vue'),
  meta: {
    skipAuth: true,
  },
}
