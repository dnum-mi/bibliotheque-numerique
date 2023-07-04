import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'

import CreateRnf from '@/views/CreateRnf.vue'
import RnfCreated from '@/views/RnfCreated.vue'

import { MAIN_TITLE } from '@/config.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: CreateRnf,
  },
  {
    path: '/result',
    name: 'RnfCreated',
    component: RnfCreated,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env?.BASE_URL || ''),
  routes,
})

router.beforeEach((to: RouteLocationNormalized) => {
  // Cf. https://github.com/vueuse/head pour des transformations avancées de Head
  const specificTitle = to.meta.title ? `${to.meta.title} - ` : ''
  document.title = `${specificTitle}${MAIN_TITLE}`
})

export default router
