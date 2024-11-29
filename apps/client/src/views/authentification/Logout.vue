<script setup lang="ts">
import type { Pinia, Store } from 'pinia'

import useToaster from '@/composables/use-toaster.js'
import { useUserStore, useCustomFilterStore } from '@/stores'

import { routeNames } from '@/router/route-names'

const userStore = useUserStore()
const router = useRouter()
const toaster = useToaster()

interface ExtendedPinia extends Pinia {
  _s: Map<string, Store>;
}

onMounted(async () => {
  useCustomFilterStore().$reset()
  try {
    await userStore.logout()
    const activePinia = getActivePinia() as ExtendedPinia
    activePinia._s.forEach(store => {
      store.$reset()
    })
  } catch {
    toaster.addErrorMessage({ description: 'une erreur est survenue à la déconnexion' })
  }
  router.push({ name: routeNames.SIGNIN })
})
</script>

<template>
  <div class="fr-container">
    <h2>Déconnexion...</h2>
  </div>
</template>
