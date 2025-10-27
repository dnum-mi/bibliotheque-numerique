import type { RouteRecordRaw } from 'vue-router'

import { routeNames } from '@/router/route-names'
import { Roles } from '@biblio-num/shared'
import { IS_OPEN_SOURCE } from '@/config'

export const organismeRoute: RouteRecordRaw = {
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
      ...(!IS_OPEN_SOURCE ? { name: routeNames.DEFAULT, alias: '/' } : {}),
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
    {
      name: routeNames.FICHE_ORGANISME_V2,
      path: 'v2/:id',
      component: () => import('@/views/organismes/organisme-v2/Organisme.vue'),
      props: (route) => {
        const id = route.params.id
        return {
          id,
        }
      },
      meta: {
        roleLevel: Roles.instructor,
      },
    },
    {
      name: routeNames.SEARCH_ORGANISMES,
      path: 'search',
      component: () => import('@/views/organismes/search/searchOrganismes.vue'),
      meta: {
        roleLevel: Roles.instructor,
      },
    },
  ],
}
