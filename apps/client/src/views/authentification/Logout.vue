<script setup lang="ts">
import { useRouter } from 'vue-router'
import useToaster from '@/composables/use-toaster.js'
import { useUserStore, useCustomFilterStore } from '@/stores'

import { onMounted } from 'vue'
import { routeNames } from '@/router/route-names'

const userStore = useUserStore()
const router = useRouter()
const toaster = useToaster()

onMounted(async () => {
  useCustomFilterStore().$reset()
  try {
    await userStore.logout()
  } catch (error) {
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
