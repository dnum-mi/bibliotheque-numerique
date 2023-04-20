import { apiClient } from '@/utils/api-client'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDossierStore = defineStore('dossier', () => {
  const dossier = ref({})
  const getDossier = async (idDossier: number) => {
    if (!idDossier) {
      console.log('idDossier doit être saisie')
      return
    }
    const result = await apiClient.getDossier(idDossier)
    if (result) dossier.value = result
  }

  return {
    dossier,
    getDossier,
  }
})
