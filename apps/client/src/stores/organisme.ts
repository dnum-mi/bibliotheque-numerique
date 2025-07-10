import type {
  IPaginated,
  IPagination,
  IOrganisme,
  ISiafAssociationOutput,
  IOrganismeOutput,
  IOrganismeOutputDto,
  ISiafRnfHistoryOutput,
  ISyncState,
  IEntityWithSyncState,
} from '@biblio-num/shared'

import apiClient from '@/api/api-client'

export type OrganismeIdType = 'Rna' | 'Rnf' | 'Id'
export enum EOrganismeIdType {
  Rna = 'Rna',
  Rnf = 'Rnf',
  Id = 'Id',
}

export const useOrganismeStore = defineStore('organisme', () => {
  const organisme = ref<IOrganisme | undefined>(undefined)
  const organismes = ref<Partial<IOrganisme>[]>([])
  const organismeSiaf = ref<IOrganismeOutputDto | ISiafAssociationOutput | undefined>(undefined)

  const syncState = ref<ISyncState | null | undefined>(undefined)

  const loadOrganisme = async (id: string, type: OrganismeIdType) => {
    if (!id) {
      return
    }
    organisme.value = undefined
    organismeSiaf.value = undefined

    const organismeOutput: IOrganismeOutput = await apiClient[`getOrganismeBy${type}`](id)
    organisme.value = organismeOutput?.bn as IOrganisme
    organismeSiaf.value = organismeOutput?.siaf as IOrganismeOutputDto | ISiafAssociationOutput
    syncState.value = (organisme.value as (IOrganisme & IEntityWithSyncState))?.syncState
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
    loadOrganisme,
    loadOrganismeHistory,
    loadOrganismes,
    exportOrganismes,
    organismeSiaf,
  }
})
