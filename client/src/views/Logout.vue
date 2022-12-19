<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'

const userStore = useUserStore()
const router = useRouter()

await userStore.logout()
router.push('/sign_in')

</script>

<template>
  <h2>Logout...</h2>
</template>
