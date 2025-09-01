import type { RouteRecordRaw } from 'vue-router'

import { routeNames } from '@/router/route-names'

export const aboutRoute: RouteRecordRaw = {
  name: routeNames.ABOUT,
  path: '/a-propos',
  component: () => import('@/views/AboutUs.vue'),
}
