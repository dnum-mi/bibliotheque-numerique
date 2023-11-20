<script setup lang="ts">
import { ref, watch, onErrorCaptured } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useRouter, useRoute } from 'vue-router'
import { AxiosError } from 'axios'

import useToaster from '@/composables/use-toaster.js'
import { useUserStore } from '@/stores'

import AppToaster from '@/components/AppToaster.vue'
import ReloadPrompt from '@/components/ReloadPrompt.vue'
import { routeNames } from '@/router/route-names'
import { Roles, isSuperiorOrSimilar } from '@/biblio-num/shared'

const serviceTitle = 'Bibliothèque Numérique'
const serviceDescription = 'Recherchez une démarche, un dossier, un organisme'
const logoText = ['Ministère', 'de l’intérieur', 'et des outre-mer']

const redColor = 'var(--red-marianne-425-625)'
const iconPropsRedColor = { color: redColor }

type QuickLink = {
  label: string;
  to: { name: string; } | string;
  icon?: string;
  iconAttrs?: Record<string, string>;
}

const quickLinks = ref<QuickLink[]>([])

const demarcheQuickLink: QuickLink = {
  label: 'Démarches',
  to: { name: routeNames.DEMARCHES },
  icon: 'ri-file-list-2-fill',
  iconAttrs: { title: 'Démarches', ...iconPropsRedColor },
}

const unauthenticatedQuickLinks: QuickLink[] = [
  {
    label: 'Se connecter',
    to: { name: routeNames.SIGNIN },
    icon: 'ri-lock-line',
    iconAttrs: { title: 'Se connecter', ...iconPropsRedColor },
  },
  {
    label: 'S’enregistrer',
    to: { name: routeNames.SIGNUP },
    icon: 'ri-user-line',
    iconAttrs: { title: 'S’enregistrer', ...iconPropsRedColor },
  },
]

const organismesQuickLink: QuickLink = {
  label: 'Organismes',
  to: { name: routeNames.LISTE_ORGANISMES },
  icon: 'ri-file-list-2-line',
  iconAttrs: { title: 'Organismes' },
}

const authenticatedQuickLinksDefault: QuickLink[] = [
  {
    label: 'Mon profil',
    to: { name: routeNames.PROFILE },
    icon: 'ri-account-circle-line',
    iconAttrs: { title: 'Mon profil' },
  },
  {
    label: 'Déconnexion',
    to: { name: routeNames.LOGOUT },
    icon: 'ri-logout-box-r-line',
    iconAttrs: { title: 'Déconnexion', ...iconColor, ...iconPropsRedColor },
  },
]

const statisticsQuickLink: QuickLink = {
  label: 'Statistiques',
  to: { name: routeNames.STATISTIQUES },
  icon: 'ri-bar-chart-box-line',
  iconAttrs: { title: 'Statistiques' },
}

const manageRolesQuickLink = {
  label: 'Administration',
  to: { name: routeNames.ADMIN },
  icon: 'ri-shield-star-line',
  iconAttrs: { ...iconColor, title: 'Administration', ...iconPropsRedColor },
}

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const getQuickLinks = () => {
  const role = userStore.currentUser?.role?.label
  if (!role) return []
  return isSuperiorOrSimilar(Roles.instructor, role)
    ? [
        demarcheQuickLink,
        organismesQuickLink,
        statisticsQuickLink,
        ...(isSuperiorOrSimilar(Roles.admin, role) ? [manageRolesQuickLink] : []),
      ]
    : []
}

watch([() => userStore.isAuthenticated, route], async () => {
  await router.isReady()

  if (userStore.isAuthenticated) {
    quickLinks.value = [
      ...getQuickLinks(),
      ...authenticatedQuickLinksDefault,
    ]
  } else {
    const isCurrentRoute = ({ to }: QuickLink) => to !== route.path && to?.name !== route.name
    quickLinks.value = unauthenticatedQuickLinks.filter(isCurrentRoute)
  }
})

const searchQuery = ref('')

const {
  offlineReady,
  needRefresh,
  updateServiceWorker,
} = useRegisterSW()

const close = async () => {
  offlineReady.value = false
  needRefresh.value = false
}

const toaster = useToaster()

onErrorCaptured((error: Error | AxiosError) => {
  if (error instanceof AxiosError) {
    if (error?.response && error?.response?.status) {
      const status = error.response.status

      const errorMessages = {
        400: 'Requête invalide. Veuillez vérifier vos données.',
        401: 'Vous n’êtes plus connecté. Veuillez vous connecter pour accéder à cette ressource.',
        403: 'Accès refusé. Vous n’avez pas les permissions nécessaires.',
        404: 'Ressource non trouvée.',
        500: 'Erreur interne du serveur. Veuillez contacter votre administrateur.',
      } as const

      const errorMessage = errorMessages[status as keyof typeof errorMessages] || 'Erreur inconnue. Veuillez réessayer.'
      toaster.addErrorMessage({ description: errorMessage })
      if (import.meta.env.DEV) {
        console.log(status)
        console.error(`Erreur HTTP [${status}]: ${errorMessage}`)
      }
    }
  } else {
    if (import.meta.env.DEV) {
      toaster.addErrorMessage({ description: error instanceof Error ? error.message : error })
      console.error('Erreur inattendue:', error)
    }
  }
  return false
})

</script>

<template>
  <div class="flex flex-col h-full w-full">
    <DsfrHeader
      v-model="searchQuery"
      :service-title="serviceTitle"
      :service-description="serviceDescription"
      :logo-text="logoText"
      :quick-links="quickLinks"
    />

    <main class="flex  flex-col  grow  w-full  h-full  min-h-0  overflow-auto">
      <router-view />
    </main>
  </div>

  <AppToaster
    :messages="toaster.messages"
    @close-message="toaster.removeMessage($event)"
  />

  <ReloadPrompt
    :offline-ready="offlineReady"
    :need-refresh="needRefresh"
    @close="close()"
    @update-service-worker="updateServiceWorker()"
  />
</template>

<style scoped>
#app {
  height: 100% !important;
  display: flex;
  flex-direction: column;
}

.raised-top-shadow {
  background-color: var(--background-raised-grey);
  filter: drop-shadow(0 -3px 5px var(--shadow-color));
}

@media screen and (max-width: 1400px) {
  :deep(.fr-header__tools-links .fr-btn) {
    padding: 0.25rem !important;
  }
}

@media screen and (max-width: 1250px) {
  :deep(.fr-header__tools-links .fr-btn) {
    font-size: 0.75rem !important;
  }
}

@media screen and (max-width: 1120px) {
  :deep(.fr-header__tools-links .fr-btn) {
    width: 30px !important;
    height: 30px !important;
    overflow: hidden !important;
  }
}
</style>
