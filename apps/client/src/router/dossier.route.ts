import type { RouteRecordRaw } from 'vue-router'

import { routeNames } from '@/router/route-names'

export const dossierRoute: RouteRecordRaw = {
  name: routeNames.DOSSIERS,
  path: '/dossiers/:id',
  component: () => import('@/views/dossiers/Dossier.vue'),
}
