import type { RouteRecordRaw } from 'vue-router'

import { routeNames } from '@/router/route-names'

export const termsOfUseRoute: RouteRecordRaw = {
  name: routeNames.TERMS_OF_USE,
  path: '/terms-of-use',
  component: () => import('@/views/TermsOfUse.vue'),
  meta: {
    title: 'Conditions Générales d\'utilisation',
    skipAuth: true,
  },
}
