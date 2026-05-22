import type { iHealthOutput } from '@biblio-num/shared'
import apiClient from '@/api/api-client'

export const useHealthStore = defineStore('health', () => {
  const health = ref<iHealthOutput>({
    status: 'up',
    timestamp: new Date(),
    // @ts-ignore ignore default object
    dependenciesHash: {},
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

  const isDegraded = computed(() => health.value.status !== 'up')

  return {
    health,
    isDegraded,
    getHealth,
    startPolling,
  }
})
