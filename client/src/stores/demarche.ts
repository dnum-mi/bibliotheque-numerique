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

    // TODO: Bouchon A retier BEGIN
    const getTypeOrganisme = (demarche) => {
      // const bouchonTypeOrganisme = {
      //   1: 'FE',
      //   2: 'FDD',
      //   3: 'FRUP',
      //   4: 'ARUP',
      //   7: 'FDD',
      //   8: 'FDD',
      //   10: 'FDD',
      //   11: 'FE',
      //   12: 'FE',
      //   15: 'FE',
      //   16: 'FE',
      //   17: 'FE',
      // }
      // return bouchonTypeOrganisme[demarche.number] || ''

      return demarche?.publishedRevision?.annotationDescriptors?.find((annotation:any) => annotation?.label === "Type d'organisme")?.description || ''
    }
    // TODO: Bouchon A retier END
    if (result) {
      demarches.value = result.map((demarche) => {
        demarche.typeOrganisme = getTypeOrganisme(demarche)
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

  return {
    demarche,
    getDemarche,
    getDemarcheByDsId,
    demarches,
    getDemarches,
    dossiers,
    getDossiers,
  }
})
