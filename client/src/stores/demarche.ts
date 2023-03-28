import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient } from '@/utils/api-client'
import { getConfigurations, updateConfigurations } from '@/shared/services'

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

  const getDemarcheByDsId = async (idDemarcheDS: number) => {
    if (!idDemarcheDS) {
      console.error('idDemarcheDS doit être saisie')
      return
    }
    const result = await apiClient.getDemarcheByDsId(idDemarcheDS)
    if (result) demarche.value = result
  }

  const demarches = ref([])
  const getDemarches = async () => {
    const result = await apiClient.getDemarches()

    if (result) {
      demarches.value = result.map((demarche: any) => {
        demarche.typeOrganisme = demarche?.typeOrganisme || ''
        return demarche
      })
    }
  }

  const dossiers = ref([])

  const getDossiers = async (idDemarche: number) => {
    if (!idDemarche) {
      console.log('idDemarche doit être saisie')
    }
    const results = await apiClient.getDossiersFromDemarche(idDemarche)
    if (results) dossiers.value = results
  }

  const demarcheConfigurations = ref([])
  const getDemarcheConfigurations = async () => {
    const champDescriptors = demarche.value?.demarcheDS?.dataJson.publishedRevision?.champDescriptors
    const annotationDescriptors = demarche.value?.demarcheDS?.dataJson.publishedRevision?.annotationDescriptors

    demarcheConfigurations.value = await getConfigurations(demarche.value.id, champDescriptors, annotationDescriptors) as any
  }

  const updateDemarcheConfigurations = async (configurationsForm: []) => {
    await updateConfigurations(demarche.value.id, configurationsForm.value)
  }

  return {
    demarche,
    getDemarche,
    getDemarcheByDsId,
    demarches,
    getDemarches,
    dossiers,
    getDossiers,
    demarcheConfigurations,
    getDemarcheConfigurations,
    updateDemarcheConfigurations,
  }
})
