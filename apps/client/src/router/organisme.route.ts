import type { RouteRecordRaw } from 'vue-router'

import { routeNames } from '@/router/route-names'
import {
  EOrganismeCategory,
  Roles,
} from '@biblio-num/shared'
import { IS_OPEN_SOURCE } from '@/config'

export const organismeRoute: RouteRecordRaw = {
  path: '/organismes',
  meta: {
    roleLevel: Roles.instructor,
  },
  children: [
    {
      name: routeNames.SEARCH_ORGANISMES,
      path: '',
      component: () => import('@/views/organismes/SearchOrganisme.vue'),
      meta: {
        roleLevel: Roles.instructor,
      },
      ...(!IS_OPEN_SOURCE ? { name: routeNames.DEFAULT, alias: '/' } : {}),
    },
    {
      name: routeNames.FICHE_ORGANISME,
      path: ':id',
      component: () => import('@/views/organismes/FicheOrganisme.vue'),
      props: (route) => {
        return {
          organismeId: route.params.id,
          organismeType: route.params.id?.toString().startsWith('W') ? EOrganismeCategory.association : EOrganismeCategory.fondation,
        }
      },
      meta: {
        roleLevel: Roles.instructor,
      },
    },
  ],
}
