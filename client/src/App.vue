<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useUserStore } from '@/stores'

import ReloadPrompt from '@/components/ReloadPrompt.vue'

const serviceTitle = 'Bibliothéque Numérique'
const serviceDescription = 'Description du service'
const logoText = ['Ministère', 'de l’intérieur']

const showSearch = false
const iconColor = { color: 'var(--red-marianne-425-625)' }
const quickLinksBase = [
  {
    label: 'Home',
    path: '/',
    icon: 'ri-home-4-line',
    iconAttrs: iconColor,
  },
  {
    label: 'Démarches',
    path: '/demarches',
  },
  {
    label: 'À propos',
    path: '/a-propos',
  },
]
const quickLinks = ref(quickLinksBase)

const userStore = useUserStore()
watch(() => userStore.isAuthenticated, () => {
  if (userStore.isAuthenticated) {
    quickLinks.value = quickLinksBase.concat(
      {
        label: 'Mon profil',
        path: '/profile',
        icon: 'ri-account-circle-line',
        iconAttrs: iconColor,
      },
      {
        label: 'Déconnexion',
        path: '/logout',
        icon: 'ri-logout-box-r-line',
        iconAttrs: iconColor,
      },
    )
  } else {
    quickLinks.value = quickLinksBase.concat(
      {
        label: 'Se connecter',
        path: '/sign_in',
        icon: 'ri-lock-line',
        iconAttrs: iconColor,
      },
      {
        label: 'S’enregistrer',
        path: '/sign_up',
        icon: 'ri-user-line',
        iconAttrs: iconColor,
      },
    )
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
</script>

<template>
  <DsfrHeader
    v-model="searchQuery"
    :service-title="serviceTitle"
    :service-description="serviceDescription"
    :logo-text="logoText"
    :quick-links="quickLinks"
    :show-search="showSearch"
  />
  <div class="fr-container">
    <router-view />
    <VIcon name="ri-flag-line" />
  </div>
  <ReloadPrompt
    :offline-ready="offlineReady"
    :need-refresh="needRefresh"
    @close="close()"
    @update-service-worker="updateServiceWorker()"
  />
</template>
