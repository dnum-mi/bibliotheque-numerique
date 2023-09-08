<script setup lang="ts">
import { ref, watch, onErrorCaptured, type Ref } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useRouter, useRoute } from 'vue-router'
import { AxiosError } from 'axios'

import useToaster from '@/composables/use-toaster.js'
import { useUserStore } from '@/stores'

import AppToaster from '@/components/AppToaster.vue'
import ReloadPrompt from '@/components/ReloadPrompt.vue'

const serviceTitle = 'Bibliothèque Numérique'
const serviceDescription = 'Recherchez une démarche, un dossier, un organisme'
const logoText = ['Ministère', 'de l’intérieur', 'et des outre-mer']

const iconColor = { color: 'var(--red-marianne-425-625)' }

type QuickLink = {
  label: string;
  to: { name: string; } | string;
  icon?: string;
  iconAttrs?: Record<string, string>;
}

const quickLinksBase: QuickLink[] = [
  // {
  //   label: 'Home',
  //   to: '/',
  //   icon: 'ri-home-4-line',
  //   iconAttrs: iconColor,
  // },
  // {
  //   label: 'À propos',
  //   to: '/a-propos',
  // },
]

const quickLinks: Ref<QuickLink[]> = ref(quickLinksBase)

const demarcheQuickLink: QuickLink = {
  label: 'Démarches',
  to: { name: 'Demarches' },
}

const unauthenticatedQuickLinks: QuickLink[] = [
  {
    label: 'Se connecter',
    to: { name: 'SignIn' },
    icon: 'ri-lock-line',
    iconAttrs: iconColor,
  },
  {
    label: 'S’enregistrer',
    to: { name: 'SignUp' },
    icon: 'ri-user-line',
    iconAttrs: iconColor,
  },
]

const authenticatedQuickLinksPart1: QuickLink[] = [
  {
    label: 'Organismes',
    to: { name: 'Organismes' },
  },
]

const authenticatedQuickLinksPart2: QuickLink[] = [
  {
    label: 'Mon profil',
    to: { name: 'Profile' },
    icon: 'ri-account-circle-line',
    iconAttrs: iconColor,
  },
  {
    label: 'Déconnexion',
    to: { name: 'LogOut' },
    icon: 'ri-logout-box-r-line',
    iconAttrs: iconColor,
  },
]

const manageRolesQuickLink = {
  label: 'Administration',
  to: { name: 'Admin' },
  icon: 'ri-shield-star-line',
  iconAttrs: iconColor,
}

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

watch([() => userStore.isAuthenticated, route], async () => {
  await router.isReady()

  const isCurrentRoute = ({ to }: QuickLink) => to !== route.path && to?.name !== route.name

  if (userStore.isAuthenticated) {
    quickLinks.value = [
      ...quickLinksBase,
      ...authenticatedQuickLinksPart1,
      ...(userStore.canAccessDemarches ? [demarcheQuickLink] : []),
      ...authenticatedQuickLinksPart2,
      ...(userStore.canManageRoles ? [manageRolesQuickLink] : []),
    ]
  } else {
    quickLinks.value = [
      ...quickLinksBase,
      ...unauthenticatedQuickLinks.filter(isCurrentRoute),
    ]
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
  const router = useRouter()

  if (error instanceof AxiosError && error?.response?.status === 404) {
    router.push({
      name: '404',
      query: { from: router.currentRoute.value.path },
    })
  } else {
    const description = (error instanceof AxiosError && error?.response?.data?.message) || error.message
    toaster.addErrorMessage({ description })
    console.error(error)
  }
  return false
})

</script>

<template>
  <DsfrHeader
    :key="quickLinks.length"
    v-model="searchQuery"
    :service-title="serviceTitle"
    :service-description="serviceDescription"
    :logo-text="logoText"
    :quick-links="quickLinks"
  />

  <div class="fr-container">
    <router-view />
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
