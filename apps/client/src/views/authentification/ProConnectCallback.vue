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
    const code = route.query.code as string | undefined
    const state = route.query.state as string | undefined
    const iss = route.query.iss as string | undefined
    if (code && state && iss) {
      await userStore.loginWithProconnect(code, state, iss)
      router.push({ name: routeNames.DEMARCHES })
    } else {
      throw new Error('Invalid proconnect code, state or iss')
    }
  } catch (e) {
    console.error(e)
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
