import type {
  CreateCustomFilterDto,
  PatchCustomFilterDto,
} from '@biblio-num/shared'

import type {
  ICustomFilter,
} from '@biblio-num/shared-utils'

import apiClient from '@/api/api-client'

export const useCustomFilterStore = defineStore('custom-filter', () => {
  const customFilters = ref<ICustomFilter[]>([])
  let currentDemarcheId: number
  const getCustomFilters = async () => {
    customFilters.value = await apiClient.getCustomFilters()
  }

  const getCustomFiltersByDemarche = async (demarcheId:number) => {
    currentDemarcheId = demarcheId
    customFilters.value = await apiClient.getCustomFiltersByDemarche(demarcheId)
  }

  const createCustomFilter = async (dto: CreateCustomFilterDto, demarcheId: number): Promise<number> => {
    const customDisplay = await apiClient.createOneCustomFilter(dto, demarcheId)
    if (customDisplay == null) {
      throw new Error('La création de l’affichage personnalisé a échoué')
    }
    await getCustomFiltersByDemarche(demarcheId)
    return customDisplay.id
  }

  const updateCustomFilter = async (id: number, dto: PatchCustomFilterDto) => {
    await apiClient.updateOneCustomFilter(id, dto)
    if (currentDemarcheId) {
      await getCustomFiltersByDemarche(currentDemarcheId)
    }
  }

  const deleteCustomFilter = async (id: number) => {
    await apiClient.deleteOneCustomFilter(id)
    if (currentDemarcheId) {
      await getCustomFiltersByDemarche(currentDemarcheId)
    }
  }

  const $reset = () => {
    customFilters.value = []
  }
  return {
    $reset,
    customFilters,
    getCustomFilters,
    createCustomFilter,
    updateCustomFilter,
    deleteCustomFilter,
    getCustomFiltersByDemarche,
  }
})
