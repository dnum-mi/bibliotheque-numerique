import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

import apiClient from '@/api/api-client'

import { toHeaderList, toRowData } from '@/shared/services/to-header-list'
import { booleanToYesNo, stateToFr, dateToStringFr } from '@/utils'
import type { IDemarche, MappingColumn, DossierSearchOutputDto, FieldSearchOutputDto, SearchDossierDto } from '@biblio-num/shared'
import { ChampValueTypesKeys, ChampType, type HeaderDataTable } from '@/shared/types'
import { fetchInstructionTimeByDossiers } from '@/shared/services/instruction-times.service'
import { EInstructionTimeState, keyInstructionTime } from '@/shared/types'

export const useDemarcheStore = defineStore('demarche', () => {
  const demarches = ref<IDemarche[]>([])
  const currentDemarche: Ref<IDemarche> = ref({})
  const currentDemarcheDossiers: Ref<DossierSearchOutputDto> = ref({})
  const currentDemarcheFields: Ref<FieldSearchOutputDto> = ref({})
  const currentDemarcheConfiguration = ref<MappingColumn[]>([])

  const updateOneMappingColumn = async (id: string, columnLabel: string): Promise<void> => {
    await apiClient.updateOneMappingColumn(currentDemarche.value.id, id, { columnLabel })
    await getCurrentDemarcheConfigurations()
  }

  const getCurrentDemarcheConfigurations = async () => {
    currentDemarcheConfiguration.value = await apiClient.getDemarcheConfiguration(currentDemarche.value.id)
  }

  const getDemarche = async (idDemarche: number) => {
    const result = await apiClient.getDemarche(idDemarche)
    if (result) {
      currentDemarche.value = result
      currentDemarcheConfiguration.value = result.m
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
