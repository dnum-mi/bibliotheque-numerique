import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import type { CreateCustomFilterDto, PatchCustomFilterDto, ICustomFilter } from '@biblio-num/shared'

import apiClient from '@/api/api-client'

export const useCustomFilterStore = defineStore('custom-filter', () => {
  const customFilters: Ref<ICustomFilter[]> = ref<ICustomFilter[]>([])

  const getCustomFilters = async () => {
    customFilters.value = await apiClient.getCustomFilters()
  }

  const createCustomFilter = async (dto: CreateCustomFilterDto) => {
    await apiClient.createOneCustomFilter(dto)
    await getCustomFilters()
  }

  const updateCustomFilter = async (id: number, dto: PatchCustomFilterDto) => {
    await apiClient.updateOneCustomFilter(id, dto)
    await getCustomFilters()
  }

  const deleteCustomFilter = async (id: number) => {
    await apiClient.deleteOneCustomFilter(id)
    await getCustomFilters()
  }

  return {
    customFilters,
    getCustomFilters,
    createCustomFilter,
    updateCustomFilter,
    deleteCustomFilter,
  }
})
