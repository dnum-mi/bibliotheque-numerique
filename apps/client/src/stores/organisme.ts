import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'

import apiClient from '@/api/api-client'
import type { IOrganisme, PaginatedDto, PaginationDto } from '@biblio-num/shared'

export type OrganismeIdType = 'Rna' | 'Rnf' | 'Id'

export const useOrganismeStore = defineStore('organisme', () => {
  const organisme = ref<IOrganisme>()
  const organismes = ref<Partial<IOrganisme>[]>([])

  const loadOrganisme = async (id: string, type: OrganismeIdType) => {
    if (!id) {
      return
    }
    organisme.value = undefined
    organisme.value = await apiClient[`getOrganismeBy${type}`](id)
  }

  const loadOrganismes = async (dto: PaginationDto<IOrganisme>): Promise<PaginatedDto<IOrganisme>> => {
    return apiClient.getOrganismes(dto)
  }

  const $reset = () => {
    organisme.value = undefined
    organismes.value = []
  }
  return {
    $reset,
    organisme,
    organismes,
    loadOrganisme,
    loadOrganismes,
  }
})
