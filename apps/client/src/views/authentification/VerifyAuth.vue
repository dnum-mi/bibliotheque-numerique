<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { routeNames } from '@/router/route-names'
import { useUserStore } from '@/stores'

const props = defineProps<{ token: string }>()

const router = useRouter()
const userStore = useUserStore()

const VerifyAuth = async () => {
  try {
    await userStore.loginWithVerifyAuth(props.token)
    router.push({ name: routeNames.DEMARCHES })
  } catch (e) {
    console.log(e)
    router.push({ name: routeNames.SIGNIN })
  }
}

onMounted(() => {
  VerifyAuth()
})
</script>

<template>
  <div>
    ...loading
  </div>
</template>
