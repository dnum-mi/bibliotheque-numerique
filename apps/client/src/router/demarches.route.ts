import type { RouteRecordRaw } from 'vue-router'

import { routeNames } from '@/router/route-names'
import { Roles } from '@biblio-num/shared'
import { IS_OPEN_SOURCE } from '@/config'

export const demarchesRoutes: RouteRecordRaw = {
  path: '/demarches',
  children: [
    {
      path: '',
      name: routeNames.DEMARCHES,
      component: () => import('@/views/demarches/Demarches.vue'),
      meta: {
        roleLevel: Roles.instructor,
      },
      ...(IS_OPEN_SOURCE && { name: routeNames.DEFAULT, alias: '/' }),
    },
    {
      path: ':demarcheId/dossiers',
      name: routeNames.DEMARCHE_DOSSIERS,
      component: () => import('@/views/demarches/demarche/Demarche.vue'),
      props: (route) => ({
        demarcheId: route.params.demarcheId,
        customDisplayId: route.query.customDisplayId,
      }),
      meta: {
        roleLevel: Roles.instructor,
        needsDemarchesId: true,
      },
    },
  ],
}
