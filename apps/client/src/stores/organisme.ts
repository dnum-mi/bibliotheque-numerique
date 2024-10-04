import type {
  IPaginated,
  IPagination,

  IOrganisme,
  ISiafAssociationOutput,
  ISiafFondationOutput,
  IOrganismeOutput,
} from '@biblio-num/shared'

import apiClient from '@/api/api-client'

export type OrganismeIdType = 'Rna' | 'Rnf' | 'Id'

export const useOrganismeStore = defineStore('organisme', () => {
  const organisme = ref<IOrganisme | undefined>(undefined)
  const organismes = ref<Partial<IOrganisme>[]>([])
  const organismeSiaf = ref<ISiafAssociationOutput | ISiafFondationOutput | undefined>(undefined)

  const loadOrganisme = async (id: string, type: OrganismeIdType) => {
    if (!id) {
      return
    }
    organisme.value = undefined
    organismeSiaf.value = undefined

    const organismeOutput: IOrganismeOutput = await apiClient[`getOrganismeBy${type}`](id)
    organisme.value = organismeOutput?.bn as IOrganisme
    organismeSiaf.value = organismeOutput?.siaf as ISiafAssociationOutput | ISiafFondationOutput
  }

  const loadOrganismes = async (dto: IPagination<IOrganisme>): Promise<IPaginated<IOrganisme>> => {
    return apiClient.getOrganismes(dto)
  }

  const exportOrganismes = async (dto: IPagination<IOrganisme>): Promise<void> => apiClient.exportOrganismes(dto)

  const $reset = () => {
    organisme.value = undefined
    organismes.value = []
    organismeSiaf.value = undefined
  }
  return {
    $reset,
    organisme,
    organismes,
    loadOrganisme,
    loadOrganismes,
    exportOrganismes,
    organismeSiaf,
  }
})
