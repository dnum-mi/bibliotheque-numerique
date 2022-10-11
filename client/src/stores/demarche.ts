import { apiClient } from '@/utils/api-client'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDemarcheStore = defineStore('demarche', () => {
  const demarche = ref({})
  const getDemarche = async (idDemarche: number) => {
    if (!idDemarche) {
      console.log('idDemarche doit être saisie')
      return
    }
    const result = await apiClient.getDemarche(idDemarche)
    if (result) demarche.value = result
  }

  return {
    demarche,
    getDemarche,
  }
})
