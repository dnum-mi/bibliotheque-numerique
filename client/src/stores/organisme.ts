import { fetchOrganimseById, fetchOrganimseByIdRNA } from '@/shared/services/organisme.service'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOrganismeStore = defineStore('organisme', () => {
  const organisme = ref({})

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
    if (result) organisme.value = result.organismeData.dataJson.data
  }

  return {
    organisme,
    loadOrganismebyId,
    loadOrganismebyIdRNA,
  }
})
