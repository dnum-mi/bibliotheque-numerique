import type { iHealthOutput } from '@biblio-num/shared'
import apiClient from '@/api/api-client.ts'

export const useHealthStore = defineStore('health', () => {
  const health = ref<iHealthOutput>({
    status: 'ok',
    timestamp: new Date(),
    dependencies: {},
    info: {
      version: 'loading',
      environment: 'production',
    },
  })

  let interval: ReturnType<typeof setInterval> | null = null

  const getHealth = async () => {
    try {
      health.value = await apiClient.getHealth()
    } catch {
      health.value.status = 'down'
    }
  }

  const startPolling = () => {
    if (interval) { return }

    interval = setInterval(() => {
      getHealth()
    }, 60_000) // 1 minute
  }

  const isDegraded = computed(() => health.value.status !== 'ok')

  return {
    health,
    isDegraded,
    getHealth,
    startPolling,
  }
})
