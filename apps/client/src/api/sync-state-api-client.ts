import type { ISyncState } from '@biblio-num/shared'
import type { AxiosInstance } from 'axios'

export function fabricSyncStateApiClient (apiClientInstance: AxiosInstance) {
  const syncStateRoute = 'sync-state/'

  const getSyncStateById = async (id: number): Promise<ISyncState> => {
    const response = await apiClientInstance.get(`${syncStateRoute}/${id}`)
    return response.data
  }

  return {
    getSyncStateById,
  }
}
