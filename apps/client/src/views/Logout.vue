<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { onMounted } from 'vue'

const userStore = useUserStore()
const router = useRouter()

onMounted(async () => {
  try {
    await userStore.logout()
  } catch (e) {
    // TODO: Afficher une erreur compréhensible à l’utilisateur
  }
  router.push('/sign_in')
})
</script>

<template>
  <div class="fr-container">
    <h2>Logout...</h2>
  </div>
</template>
