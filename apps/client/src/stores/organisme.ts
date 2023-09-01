import { ref } from 'vue'
import { defineStore } from 'pinia'

import apiClient from '@/api/api-client'

export const useOrganismeStore = defineStore('organisme', () => {
  const formatData = (data: { zipCode: string; city: any }) => {
    return {
      ...data,
      prefecture: `${data?.zipCode?.substring(0, 2) || ''} - ${data?.city || ''}`,
      // type: 'CULTES',
    }
  }

  const organisme = ref<any>({})
  const organismes = ref<any[]>([])

  const loadOrganismeByIdRNA = async (id: string) => {
    if (!id) {
      return
    }
    const result = await apiClient.getOrganismeByIdRna(id)
    if (result) {
      organisme.value = result
    }
  }

  const loadOrganismes = async () => {
    const result = await apiClient.getOrganismes()
    if (result) {
      organismes.value = result?.map((data: any) => { const newData = formatData(data); return newData })
    }
  }

  return {
    organisme,
    organismes,
    loadOrganismeByIdRNA,
    loadOrganismes,
  }
})
