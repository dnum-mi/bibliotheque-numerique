import type { RouteRecordRaw } from 'vue-router'

import { routeNames } from '@/router/route-names'
import { Roles } from '@biblio-num/shared'

export const statisticRoute: RouteRecordRaw = {
  name: routeNames.STATISTIQUES,
  path: '/statistiques',
  component: () => import('@/views/statistics/Statistics.vue'),
  meta: {
    title: 'Statistiques',
    roleLevel: Roles.instructor,
  },
}
