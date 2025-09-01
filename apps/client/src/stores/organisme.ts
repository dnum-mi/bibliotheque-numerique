import type {
  IPaginated,
  IPagination,
  IOrganisme,
  IOrganismeOutput,
  IOrganismeOutputDto,
  ISiafRnfHistoryOutput,
  IEntityWithSyncState,
} from '@biblio-num/shared'

import apiClient from '@/api/api-client'
import type { TSyncState } from '../shared/types'

export type OrganismeIdType = 'Rna' | 'Rnf' | 'Id'
export enum EOrganismeIdType {
  Rna = 'Rna',
  Rnf = 'Rnf',
  Id = 'Id',
}

export const useOrganismeStore = defineStore('organisme', () => {
  const organisme = ref<IOrganisme | undefined>(undefined)
  const organismes = ref<Partial<IOrganisme>[]>([])
  const organismeSiaf = ref<IOrganismeOutputDto | undefined>(undefined)

  const syncState = ref<TSyncState>(undefined)
  const dossiersCount = ref<number | null>(null)

  const loadOrganisme = async (id: string, type: OrganismeIdType) => {
    if (!id) {
      return
    }
    organisme.value = undefined
    organismeSiaf.value = undefined

    const organismeOutput: IOrganismeOutput = await apiClient[`getOrganismeBy${type}`](id)
    organisme.value = organismeOutput?.bn as IOrganisme
    organismeSiaf.value = organismeOutput?.siaf as IOrganismeOutputDto
    syncState.value = ((organisme.value as (IOrganisme & IEntityWithSyncState))?.syncState || organismeOutput?.syncState) as TSyncState
    dossiersCount.value = organismeOutput?.dossiersCount || null
  }

  const loadOrganismeHistory = async (id: string, type: OrganismeIdType): Promise<ISiafRnfHistoryOutput[]> => {
    if (!id || type !== EOrganismeIdType.Rnf) {
      return []
    }
    return await apiClient.getOrganismeHistoryByRnf(id)
  }

  const loadOrganismes = async (dto: IPagination<IOrganisme>): Promise<IPaginated<IOrganisme>> => {
    return apiClient.getOrganismes(dto)
  }

  const exportOrganismes = async (dto: IPagination<IOrganisme>): Promise<void> => apiClient.exportOrganismes(dto)

  const $reset = () => {
    organisme.value = undefined
    organismes.value = []
    organismeSiaf.value = undefined
    syncState.value = null
  }

  return {
    $reset,
    organisme,
    organismes,
    syncState,
    dossiersCount,
    loadOrganisme,
    loadOrganismeHistory,
    loadOrganismes,
    exportOrganismes,
    organismeSiaf,
  }
})
