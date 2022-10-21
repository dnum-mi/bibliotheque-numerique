import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/AppHome.vue'
import AboutUs from '../views/AboutUs.vue'
import DemarcheDossiersVue from '@/views/DemarcheDossiers.vue'
import DemarchesVue from '@/views/Demarches.vue'
import DossierVue from '@/views/Dossier.vue'

const MAIN_TITLE = 'Gabarit de démarrage VueDsfr'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/a-propos',
    name: 'About',
    component: AboutUs,
  },
  {
    path: '/demarches/:id/dossiers',
    name: 'DemarcheDossiers',
    component: DemarcheDossiersVue,
  },
  // {
  //   path: '/dossiers&filtre=',
  //   name: 'DemarcheDossiers',
  //   component: DossiersDemarcheVue,
  // },
  {
    path: '/dossiers/:id',
    name: 'Dossier',
    component: DossierVue,
  },
  {
    path: '/demarches',
    name: 'Demarches',
    component: DemarchesVue,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env?.BASE_URL || ''),
  routes,
})

router.beforeEach((to) => { // Cf. https://github.com/vueuse/head pour des transformations avancées de Head
  const specificTitle = to.meta.title ? `${to.meta.title} - ` : ''
  document.title = `${specificTitle}${MAIN_TITLE}`
})

export default router
