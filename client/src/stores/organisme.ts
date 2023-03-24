import { fetchOrganimseById, fetchOrganimseByIdRNA, fetchOrganimses } from '@/shared/services/organisme.service'
import { defineStore } from 'pinia'
import { ref } from 'vue'

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

  const loadOrganismebyId = async (id: number) => {
    if (!id) {
      console.log(`Pas de valeur id: ${id}`)
      return
    }
    const result = await fetchOrganimseById(id)
    if (result) organisme.value = result
  }

  const loadOrganismebyIdRNA = async (id: string) => {
    if (!id) {
      console.log(`Pas de valeur id: ${id}`)
      return
    }
    const result = await fetchOrganimseByIdRNA(id)
    if (result) organisme.value = result?.dataJson
  }

  const loadOrganismes = async () => {
    const result = await fetchOrganimses()
    // if (result) organisme.value = result.organismeData.dataJson.data
    if (result) organismes.value = result?.map((data: any) => { const newData = formatData(data); return newData })
  }

  return {
    organisme,
    organismes,
    loadOrganismebyId,
    loadOrganismebyIdRNA,
    loadOrganismes,
  }
})
