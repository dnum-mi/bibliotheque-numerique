<script setup lang="ts">
import { ref, watch, onErrorCaptured } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useRouter } from 'vue-router'

import ReloadPrompt from '@/components/ReloadPrompt.vue'
import { useUserStore } from '@/stores'

import useToaster from '@/composables/use-toaster'

const serviceTitle = 'Bibliothèque Numérique'
const serviceDescription = 'Recherchez une démarche, un dossier, un organisme'
const logoText = ['Ministère', 'de l’intérieur', 'et des outre-mer']

const iconColor = { color: 'var(--red-marianne-425-625)' }
const quickLinks = ref([])

const userStore = useUserStore()
watch(() => userStore.isAuthenticated, () => {
  quickLinks.value = []
  if (userStore.isAuthenticated) {
    quickLinks.value = quickLinks.value.concat({
      label: 'Organismes',
      path: '/organismes',
    })

    if (userStore.canAccessDemarches) {
      quickLinks.value = quickLinks.value.concat({
        label: 'Démarches',
        path: '/demarches',
      })
    }
    quickLinks.value = quickLinks.value.concat(
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
    if (userStore.canManageRoles) {
      quickLinks.value = quickLinks.value.concat({
        label: 'Administration',
        path: '/admin',
        icon: 'ri-shield-star-line',
        iconAttrs: iconColor,
      })
    }
  } else {
    quickLinks.value = [
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

const hasError = ref(false)
const descriptionError = ref('Description du message')
onErrorCaptured((error) => {
  const router = useRouter()

  if (error?.response?.status === 404) {
    console.debug({ error, router: router.currentRoute.value })
    router.push({ name: '404', params: { pathMatch: router.currentRoute.value.path } })
  } else {
    hasError.value = true
    descriptionError.value = error?.response?.data?.message || error.message
    console.error(error)
  }
  return false
})

</script>

<template>
  <DsfrHeader
    v-model="searchQuery"
    :service-title="serviceTitle"
    :service-description="serviceDescription"
    :logo-text="logoText"
    :quick-links="quickLinks"
  />

  <DsfrAlert
    v-if="hasError"
    title="Erreur"
    :description="descriptionError"
    type="error"
    small
    closeable
    @close="hasError=false"
  />

  <div>
    <router-view />
  </div>

  <ReloadPrompt
    :offline-ready="offlineReady"
    :need-refresh="needRefresh"
    @close="close()"
    @update-service-worker="updateServiceWorker()"
  />
</template>
