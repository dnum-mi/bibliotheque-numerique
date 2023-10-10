import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { DossierOutputDto } from '@biblio-num/shared'

import apiClient from '@/api/api-client'

export const useDossierStore = defineStore('dossier', () => {
  const dossier = ref<DossierOutputDto>()
  const getDossier = async (idDossier: number) => {
    if (!idDossier) {
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
