import type { RouteRecordRaw } from 'vue-router'

import { routeNames } from '@/router/route-names'
import { Roles } from '@/biblio-num/shared'

export const demarchesRoutes: RouteRecordRaw = {
  path: '/',
  children: [
    {
      path: '',
      name: routeNames.DEMARCHES,
      component: () => import('@/views/demarches/Demarches.vue'),
      meta: {
        roleLevel: Roles.instructor,
      },
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
