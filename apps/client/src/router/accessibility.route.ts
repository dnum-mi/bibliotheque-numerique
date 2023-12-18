import type { RouteRecordRaw } from 'vue-router'

import { routeNames } from '@/router/route-names'

export const accessibilityRoute: RouteRecordRaw = {
  name: routeNames.ACCESSIBILITY,
  path: '/accessibility',
  component: () => import('@/views/Accessibility.vue'),
  meta: {
    skipAuth: true,
  },
}
