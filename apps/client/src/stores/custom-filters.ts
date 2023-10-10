import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import type { CreateCustomFilterDto, PatchCustomFilterDto, SmallCustomFilterDto } from '@biblio-num/shared'

import apiClient from '@/api/api-client'

export const useCustomFilterStore = defineStore('custom-filter', () => {
  const customFilters: Ref<SmallCustomFilterDto[]> = ref<SmallCustomFilterDto[]>([])
  let currentDemarcheId: number
  const getCustomFilters = async () => {
    customFilters.value = await apiClient.getCustomFilters()
  }

  const getCustomFiltersByDemarche = async (demarcheId:number) => {
    currentDemarcheId = demarcheId
    customFilters.value = await apiClient.getCustomFiltersByDemarche(demarcheId)
  }

  const createCustomFilter = async (dto: CreateCustomFilterDto, demarcheId: number) => {
    await apiClient.createOneCustomFilter(dto, demarcheId)
    await getCustomFiltersByDemarche(demarcheId)
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
