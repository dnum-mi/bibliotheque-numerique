import { useConfigurationStore } from '@/stores/configuration'

export function useConfiguration () {
  const configStore = useConfigurationStore()
  const { isAssociationsEnabled } = storeToRefs(configStore)

  return {
    isAssociationsEnabled,
  }
}
