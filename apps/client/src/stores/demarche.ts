import { defineStore } from 'pinia'
import { ref, computed, type Ref, type ComputedRef } from 'vue'

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
  const demarches: Ref<IDemarche[]> = ref<IDemarche[]>([])
  const currentDemarche: Ref<IDemarche | undefined> = ref()
  const currentDemarcheDossiers = ref<DossierSearchOutputDto | FieldSearchOutputDto>({ total: 0, data: [] })
  const currentDemarcheConfiguration = ref<MappingColumnWithoutChildren[]>([])
  const currentDemarchePlaneConfiguration: ComputedRef<FrontMappingColumn[]> = computed(() => currentDemarcheConfiguration.value
    .map((c: MappingColumn) => c.children?.length ? c.children.map(c => ({ ...c, isChild: true })) : [c])
    .flat(1)
    .filter(c => !!c.columnLabel) as FrontMappingColumn[])
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
    if (currentDemarche.value) {
      await apiClient.updateOneMappingColumn(currentDemarche.value.id, id, { columnLabel })
      await getCurrentDemarcheConfigurations()
    }
  }

  const getCurrentDemarcheConfigurations = async () => {
    if (currentDemarche.value) {
      _setConfiguration(await apiClient.getDemarcheConfiguration(currentDemarche.value.id))
    }
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

  return {
    demarches,
    currentDemarche,
    currentDemarcheConfiguration,
    currentDemarchePlaneConfiguration,
    currentDemarcheConfigurationHash,
    currentDemarcheDossiers,
    getDemarches,
    getCurrentDemarcheConfigurations,
    searchCurrentDemarcheDossiers,
    getDemarche,
    updateOneMappingColumn,
  }
})
