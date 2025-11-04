import apiClient from '@/api/api-client'
import type {
  IDossierSearchOutput,
  IFieldSearchOutput,
  ISearchDossier,
  IDemarche,
  IMappingColumn,
  IMappingColumnWithoutChildren,
  ISmallDemarcheOutput,
  IDemarcheOption,
  IMappingAnonymizedChamp,
  IPaginated,
  IPaginationSmallDemarche,
} from '@biblio-num/shared'

export type FrontIMappingColumn = IMappingColumnWithoutChildren & { isChild: boolean }

export const useDemarcheStore = defineStore('demarche', () => {
  const demarches = ref<ISmallDemarcheOutput[]>([])
  const currentDemarche = ref<IDemarche>()
  const currentDemarcheDossiers = ref<IDossierSearchOutput | IFieldSearchOutput>({ total: 0, data: [] })
  const currentDemarcheConfiguration = ref<IMappingColumn[]>([])
  const currentDemarcheOptions = ref<IDemarcheOption | null>(null)
  const currentAnonymizedChamps = ref<IMappingAnonymizedChamp[]>([])

  const currentDemarcheFlatConfiguration = computed<FrontIMappingColumn[]>(
    () =>
      currentDemarcheConfiguration.value
        .map((c: IMappingColumn) => (c.children?.length ? c.children.map((c) => ({ ...c, isChild: true })) : [c]))
        .flat(1)
        .filter((c) => !!c.columnLabel) as FrontIMappingColumn[],
  )
  // hash will be easier to manipulate
  const currentDemarcheConfigurationHash = ref<Record<string, IMappingColumn>>({})

  const _setConfiguration = (configuration: IMappingColumn[]) => {
    currentDemarcheConfiguration.value = configuration
    currentDemarcheConfigurationHash.value = Object.fromEntries(
      configuration
        .flatMap((c: IMappingColumn) => (c.children?.length ? c.children.map((c: IMappingColumnWithoutChildren) => ({ ...c, isChild: true })) : [c]))
        .filter((c) => c.columnLabel) // filter out empty columnLabel
        .map((c) => [c.id, c]),
    )
  }

  const getCurrentDemarcheConfigurations = async () => {
    if (currentDemarche.value) {
      _setConfiguration(await apiClient.getDemarcheConfiguration(currentDemarche.value.id))
    }
  }

  const updateOneMappingColumn = async (id: string, columnLabel: string | null): Promise<void> => {
    if (currentDemarche.value) {
      await apiClient.updateOneMappingColumn(currentDemarche.value.id, id, { columnLabel: columnLabel ?? null })
      await getCurrentDemarcheConfigurations()
    }
  }

  const fetching = ref(false)
  const getDemarche = async (idDemarche: number) => {
    fetching.value = true
    currentDemarche.value = undefined
    const result = await apiClient.getDemarche(idDemarche)
    if (result) {
      currentDemarche.value = result
      _setConfiguration(result.mappingColumns)
    }
    fetching.value = false
  }

  const getDemarches = async () => {
    demarches.value = await apiClient.getSmallDemarches()
  }

  const loadDemarches = async (dto: IPaginationSmallDemarche): Promise<IPaginated<ISmallDemarcheOutput>> => {
    return apiClient.listSmallDemarches(dto)
  }

  const searchCurrentDemarcheDossiers = async (
    groupByDossier: boolean,
    dto: ISearchDossier,
  ): Promise<IDossierSearchOutput | IFieldSearchOutput> => {
    if (currentDemarche.value) {
      currentDemarcheDossiers.value = groupByDossier
        ? await apiClient.searchDemarcheDossiers(currentDemarche.value.id, dto)
        : await apiClient.searchDemarcheFields(currentDemarche.value.id, dto)
      return currentDemarcheDossiers.value
    } else {
      throw new Error('Veuillez d’abord sélectionner une démarche')
    }
  }

  const exportCurrentDemarcheDossiers = async (groupByDossier: boolean, dto: ISearchDossier): Promise<void> => {
    if (currentDemarche.value) {
      return groupByDossier
        ? await apiClient.exportDemarcheDossiers(currentDemarche.value.id, dto)
        : await apiClient.exportDemarcheFields(currentDemarche.value.id, dto)
    } else {
      throw new Error('Veuillez d’abord sélectionner une démarche')
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

  const getCurrentDemarcheOptions = async () => {
    if (currentDemarche.value) {
      currentDemarcheOptions.value = await apiClient.getDemarcheOptions(currentDemarche.value.id)
    }
  }

  const saveDemarcheOptions = async (options: Partial<IDemarcheOption>) => {
    if (currentDemarche.value && currentDemarcheOptions.value) {
      await apiClient.saveDemarcheOptions(currentDemarche.value.id, options)
      await getCurrentDemarcheOptions()
    }
  }

  const getAnonymizedChamps = async () => {
    if (currentDemarche.value) {
      currentAnonymizedChamps.value = await apiClient.getAnonymizedChamps(currentDemarche.value.id)
    }
  }

  const updateOneMappingAnonymizedChamp = async (id: string, columnLabel: string | null): Promise<void> => {
    if (currentDemarche.value) {
      await apiClient.updateOneMappingAnonymized(currentDemarche.value.id, { id, add: !!columnLabel })
      getAnonymizedChamps()
    }
  }

  return {
    $reset,
    demarches,
    currentDemarche,
    currentDemarcheConfiguration,
    currentDemarcheFlatConfiguration,
    currentDemarcheConfigurationHash,
    currentDemarcheDossiers,
    currentDemarcheOptions,
    currentAnonymizedChamps,
    loadDemarches,
    getDemarches,
    getCurrentDemarcheConfigurations,
    searchCurrentDemarcheDossiers,
    getDemarche,
    updateOneMappingColumn,
    exportCurrentDemarcheDossiers,
    fetching,
    getCurrentDemarcheOptions,
    saveDemarcheOptions,
    updateOneMappingAnonymizedChamp,
    getAnonymizedChamps,
  }
})
