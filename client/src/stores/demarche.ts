import { apiClient } from '@/utils/api-client'
import { generateDossiers } from '@/views/__tests__/dossiers'
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

  const demarches = ref([])
  const getDemarches = async () => {
    const result = await apiClient.getDemarches()
    console.log({ result })
    if (result) demarches.value = result
  }

  const dossiers = ref([])
  const getDossiers = async (idDemarche: number) => {
    if (!idDemarche) {
      console.log('idDemarche doit être saisie')
    }
    // const result = await apiClient.getDossiers(idDemarche)
    // if (result) dossiers.value = result
    // TODO: Bouvchon à retirer
    dossiers.value = generateDossiers()
  }

  return {
    demarche,
    getDemarche,
    demarches,
    getDemarches,
    dossiers,
    getDossiers,
  }
})
