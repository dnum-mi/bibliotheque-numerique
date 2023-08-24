import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

import apiClient from '@/api/api-client'

import type { IDemarche, MappingColumn, DossierSearchOutputDto, FieldSearchOutputDto, SearchDossierDto } from '@biblio-num/shared'

export const useDemarcheStore = defineStore('demarche', () => {
  const demarches: Ref<IDemarche[]> = ref<IDemarche[]>([])
  const currentDemarche: Ref<IDemarche> = ref({})
  const currentDemarcheDossiers: Ref<DossierSearchOutputDto> = ref({})
  const currentDemarcheFields: Ref<FieldSearchOutputDto> = ref({})
  const currentDemarcheConfiguration = ref<MappingColumn[]>([])
  // hash will be easier to manipulate
  const currentDemarcheConfigurationHash = ref<Record<string, MappingColumn>>({})

  const _setConfiguration = (configuration: MappingColumn[]) => {
    currentDemarcheConfiguration.value = configuration.sort((c1, c2) => {
      const c1Label = !!c1.columnLabel || !!c1?.children?.find((c) => !!c.columnLabel)
      const c2Label = !!c2.columnLabel || !!c2?.children?.find((c) => !!c.columnLabel)
      return c1Label && !c2Label ? -1 : 1
    })
    currentDemarcheConfigurationHash.value = Object.fromEntries(configuration
      .filter((c) => c.columnLabel) // filter out empty columnLabel
      .map((c) => [c.id, c]))
  }

  const updateOneMappingColumn = async (id: string, columnLabel: string): Promise<void> => {
    await apiClient.updateOneMappingColumn(currentDemarche.value.id, id, { columnLabel })
    await getCurrentDemarcheConfigurations()
  }

  const getCurrentDemarcheConfigurations = async () => {
    _setConfiguration(await apiClient.getDemarcheConfiguration(currentDemarche.value.id))
  }

  const getDemarche = async (idDemarche: number) => {
    const result = await apiClient.getDemarche(idDemarche)
    if (result) {
      currentDemarche.value = result
      _setConfiguration(result.mappingColumns)
    }
  }

  const getDemarches = async () => {
    demarches.value = await apiClient.getDemarches()
  }

  const searchCurrentDemarcheDossiers = async (dto: SearchDossierDto) => {
    currentDemarcheDossiers.value = await apiClient.searchDemarcheDossiers(currentDemarche.value.id, dto)
  }

  const searchCurrentDemarcheFields = async (dto: SearchDossierDto) => {
    currentDemarcheDossiers.value = await apiClient.searchDemarcheFields(currentDemarche.value.id, dto)
  }

  return {
    demarches,
    currentDemarche,
    currentDemarcheConfiguration,
    currentDemarcheConfigurationHash,
    currentDemarcheFields,
    currentDemarcheDossiers,

    getDemarches,
    getCurrentDemarcheConfigurations,
    searchCurrentDemarcheDossiers,
    searchCurrentDemarcheFields,
    getDemarche,
    updateOneMappingColumn,
  }
})
