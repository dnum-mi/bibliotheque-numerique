import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'

import Home from '../views/AppHome.vue'

import { MAIN_TITLE } from '@/config.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env?.BASE_URL || ''),
  routes,
})

router.beforeEach((to: RouteLocationNormalized) => { // Cf. https://github.com/vueuse/head pour des transformations avancées de Head
  const specificTitle = to.meta.title ? `${to.meta.title} - ` : ''
  document.title = `${specificTitle}${MAIN_TITLE}`
})

export default router
