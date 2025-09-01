<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { routeNames } from '@/router/route-names'
import { useUserStore } from '@/stores'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const proConnectCallback = async () => {
  try {
    const { code, state, iss } = route.query as { code?: string, state?: string, iss?: string }
    if (code && state && iss) {
      await userStore.loginWithProconnect(code, state, iss)
      router.push({ name: routeNames.DEFAULT })
    } else {
      throw new Error('Invalid proconnect code, state or iss')
    }
  } catch (e) {
    console.log(e)
    router.push({ name: routeNames.SIGNIN })
  }
}

onMounted(() => {
  proConnectCallback()
})
</script>

<template>
  <div>
    ...loading
  </div>
</template>
