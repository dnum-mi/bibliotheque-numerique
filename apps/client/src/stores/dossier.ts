import type { IDossierFieldsOutput, IDossierOutput } from '@biblio-num/shared'

import apiClient from '@/api/api-client'

export const useDossierStore = defineStore('dossier', () => {
  const dossier = ref<IDossierOutput | IDossierFieldsOutput>()
  const getDossier = async (idDossier: number) => {
    if (!idDossier) {
      return
    }
    dossier.value = await apiClient.getDossier(idDossier)
  }

  const getDossierWithFields = async (id: number) => {
    if (!id) {
      return
    }

    dossier.value = await apiClient.getDossierWithFields(id)
  }

  const $reset = () => {
    dossier.value = undefined
  }
  return {
    $reset,
    dossier,
    getDossier,
    getDossierWithFields,
  }
})
