import type { NavigationGuardNext, RouteLocationNormalized, RouteLocationNormalizedLoaded, RouteRecordRaw } from 'vue-router'

import { routeNames } from '@/router/route-names'
import {
  EOrganismeCategory,
  Roles,
} from '@biblio-num/shared'
import { IS_OPEN_SOURCE } from '@/config'
import { useOrganismeHubStore } from '../stores/organisme-hub'
import useToaster from '../composables/use-toaster'

const beforeEnter = async (to: RouteLocationNormalized, from: RouteLocationNormalizedLoaded, next: NavigationGuardNext) => {
  const toaster = useToaster()
  const id = to.params.id as string
  const messageId = toaster.addSuccessMessage(`Chargement la fiche pour cet organisme (${id}) est en cours`)
  const organismeStore = useOrganismeHubStore()
  let isOk = false
  try {
    isOk = await organismeStore.setCurrentOrganismeByRef(to.params.id as string)
  } catch (e) {
    console.warn('router', e)
  }
  if (isOk && organismeStore.currentOrganisme) {
    toaster.removeMessage(messageId)
    return next(true)
  }
  toaster.removeMessage(messageId)
  toaster.addErrorMessage(`impossible de charger la fiche pour cet organisme (${id})`)
  if (!from.name || from.name === routeNames.FICHE_ORGANISME) {
    return next(true)
  }
  return next(false)
}

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
      beforeEnter,
    },
  ],
}
