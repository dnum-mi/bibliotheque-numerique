<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'

import useToaster from '@/composables/use-toaster.js'

import AppToaster from '@/components/AppToaster.vue'
import ReloadPrompt from '@/components/ReloadPrompt.vue'
import { MAIN_TITLE } from './config.js'

const serviceTitle = 'RNF'
const serviceDescription = MAIN_TITLE
const logoText = ['Ministère', 'de l’intérieur', 'et des outre-mer']

const {
  offlineReady,
  needRefresh,
  updateServiceWorker,
} = useRegisterSW()

const close = () => {
  offlineReady.value = false
  needRefresh.value = false
}

const toaster = useToaster()
</script>

<template>
  <DsfrHeader
    :service-title="serviceTitle"
    :service-description="serviceDescription"
    :logo-text="logoText"
  />

  <RouterView />

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
