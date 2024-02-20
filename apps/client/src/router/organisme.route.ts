import type { RouteRecordRaw } from 'vue-router'

import { routeNames } from '@/router/route-names'
import { Roles } from '@biblio-num/shared'

export const organismeRoute: RouteRecordRaw = {
  name: routeNames.ORGANISMES,
  path: '/organismes',
  meta: {
    roleLevel: Roles.instructor,
  },
  children: [
    {
      name: routeNames.LISTE_ORGANISMES,
      path: '',
      component: () => import('@/views/organismes/list/ListeOrganismes.vue'),
      meta: {
        roleLevel: Roles.instructor,
      },
    },
    {
      name: routeNames.FICHE_ORGANISME,
      path: ':id',
      component: () => import('@/views/organismes/organisme/FicheOrganisme.vue'),
      props: (route) => {
        const id = route.params.id
        const idType = route.query.idType || 'Id'
        return {
          id,
          idType,
        }
      },
      meta: {
        roleLevel: Roles.instructor,
      },
    },
  ],
}
