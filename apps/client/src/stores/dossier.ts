import type { IDossierOutput } from '@biblio-num/shared'

import apiClient from '@/api/api-client'

export const useDossierStore = defineStore('dossier', () => {
  const dossier = ref<IDossierOutput>()
  const getDossier = async (idDossier: number) => {
    if (!idDossier) {
      return
    }
    dossier.value = undefined
    const result = await apiClient.getDossier(idDossier)
    dossier.value = result
  }

  const $reset = () => {
    dossier.value = undefined
  }
  return {
    $reset,
    dossier,
    getDossier,
  }
})
