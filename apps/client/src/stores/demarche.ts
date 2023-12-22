import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import apiClient from '@/api/api-client'

import type {
  IDemarche,
  MappingColumn,
  MappingColumnWithoutChildren,
  DossierSearchOutputDto,
  FieldSearchOutputDto,
  SearchDossierDto,
} from '@biblio-num/shared'

export type FrontMappingColumn = MappingColumnWithoutChildren & { isChild: boolean }

export const useDemarcheStore = defineStore('demarche', () => {
  const demarches = ref<IDemarche[]>([])
  const currentDemarche = ref<IDemarche>()
  const currentDemarcheDossiers = ref<DossierSearchOutputDto | FieldSearchOutputDto>({ total: 0, data: [] })
  const currentDemarcheConfiguration = ref<MappingColumn[]>([])

  const currentDemarcheFlatConfiguration = computed<FrontMappingColumn[]>(() => currentDemarcheConfiguration.value
    .map((c: MappingColumn) => c.children?.length ? c.children.map(c => ({ ...c, isChild: true })) : [c])
    .flat(1)
    .filter(c => !!c.columnLabel) as FrontMappingColumn[])
  // hash will be easier to manipulate
  const currentDemarcheConfigurationHash = ref<Record<string, MappingColumn>>({})

  const _setConfiguration = (configuration: MappingColumn[]) => {
    currentDemarcheConfiguration.value = configuration
    currentDemarcheConfigurationHash.value = Object.fromEntries(configuration
      .filter((c) => c.columnLabel) // filter out empty columnLabel
      .map((c) => [c.id, c]))
  }

  const updateOneMappingColumn = async (id: string, columnLabel: string | null): Promise<void> => {
    if (currentDemarche.value) {
      await apiClient.updateOneMappingColumn(currentDemarche.value.id, id, { columnLabel: columnLabel ?? null })
      await getCurrentDemarcheConfigurations()
    }
  }

  const getCurrentDemarcheConfigurations = async () => {
    if (currentDemarche.value) {
      _setConfiguration(await apiClient.getDemarcheConfiguration(currentDemarche.value.id))
    }
  }

  const fetching = ref(false)
  const getDemarche = async (idDemarche: number) => {
    fetching.value = true
    const result = await apiClient.getDemarche(idDemarche)
    if (result) {
      currentDemarche.value = result
      _setConfiguration(result.mappingColumns)
    }
    fetching.value = false
  }

  const getDemarches = async () => {
    demarches.value = await apiClient.getDemarches()
  }

  const searchCurrentDemarcheDossiers = async (groupByDossier: boolean, dto: SearchDossierDto): Promise<DossierSearchOutputDto | FieldSearchOutputDto> => {
    if (currentDemarche.value) {
      currentDemarcheDossiers.value = groupByDossier
        ? await apiClient.searchDemarcheDossiers(currentDemarche.value.id, dto)
        : await apiClient.searchDemarcheFields(currentDemarche.value.id, dto)
      return currentDemarcheDossiers.value
    } else {
      throw new Error("Can't search without a current demarche")
    }
  }

  const exportCurrentDemarcheDossiers = async (groupByDossier: boolean, dto: SearchDossierDto): Promise<void> => {
    if (currentDemarche.value) {
      return groupByDossier
        ? await apiClient.exportDemarcheDossiers(currentDemarche.value.id, dto)
        : await apiClient.exportDemarcheFields(currentDemarche.value.id, dto)
    } else {
      throw new Error("Can't search without a current demarche")
    }
  }

  const $reset = () => {
    demarches.value = []
    currentDemarche.value = undefined
    currentDemarcheDossiers.value = { total: 0, data: [] }
    currentDemarcheConfiguration.value = []
    fetching.value = false
    currentDemarcheConfigurationHash.value = {}
  }

  return {
    $reset,
    demarches,
    currentDemarche,
    currentDemarcheConfiguration,
    currentDemarcheFlatConfiguration,
    currentDemarcheConfigurationHash,
    currentDemarcheDossiers,
    getDemarches,
    getCurrentDemarcheConfigurations,
    searchCurrentDemarcheDossiers,
    getDemarche,
    updateOneMappingColumn,
    exportCurrentDemarcheDossiers,
    fetching,
  }
})
