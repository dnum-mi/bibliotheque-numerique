import type { RouteRecordRaw } from 'vue-router'

import { routeNames } from '@/router/route-names'
import { Roles } from '@biblio-num/shared'

export const configurationRoute: RouteRecordRaw = {
  name: routeNames.CONFIGURATION_DEMARCHES,
  path: '/configuration',
  component: () => import('@/views/Configuration/Configuration.vue'),
  meta: {
    roleLevel: Roles.sudo,
  },

}
