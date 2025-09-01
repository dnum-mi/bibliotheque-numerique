import type { RouteRecordRaw } from 'vue-router'

import { routeNames } from '@/router/route-names'

export const profileRoute: RouteRecordRaw = {
  name: routeNames.PROFILE,
  path: '/profile',
  component: () => import('@/views/profile/Profile.vue'),
}
