import { bnConfigurationsApiClient, demarchesApiClient } from '../api/api-client'
import {
  eBnConfiguration,
} from '@biblio-num/shared'
import type {
  BnConfigurationKey,
  IBnConfigurationOutput,
  ICreateBnConfiguration,
  ICreateDemarche,
  ISmallDemarcheOutput,
  IUpdateBnConfiguration,
  IUpdateDemarche,
  IdentificationDemarcheKey,
  OrganismeTypeKey,
} from '@biblio-num/shared'

import {
  createDemarche,
  patchDemarche,
  patchToFixOrganismeByDemarche,
  putSynchronizeOneDemarche,
} from '../api/sudo-api-client'

export const useConfigurationStore = defineStore('Configuration', () => {
  const bnConfigurations = ref<IBnConfigurationOutput[]>([])
  const clientConfigurations = ref<IBnConfigurationOutput[]>([])
  const demarches = ref<ISmallDemarcheOutput[]>([])

  const fetching = ref<boolean>(false)
  const fetchingConfigurations = ref({
    bn: false,
    client: false,
  })
  const configClientLoaded = ref<boolean>(false)

  const configMap = computed(() => {
    return new Map(clientConfigurations.value.map((config) => [config.keyName, config.stringValue]))
  })

  const getConfig = (key: BnConfigurationKey) => configMap.value.get(key)

  const isAssociationsEnabled = computed(() => getConfig(eBnConfiguration.IS_ASSOCIATIONS_ENABLED) === 'true')

  const loadDemarches = async () => {
    fetching.value = true
    try {
      demarches.value = await demarchesApiClient.getSmallDemarches()
    } finally {
      fetching.value = false
    }
    return demarches.value
  }

  const loadBnConfigurations = async () => {
    fetchingConfigurations.value.bn = true
    try {
      bnConfigurations.value = await bnConfigurationsApiClient.getBnConfigurations()
    } finally {
      fetchingConfigurations.value.bn = false
    }
  }

  const loadClientConfigurations = async () => {
    fetchingConfigurations.value.client = true
    try {
      const configurations = await bnConfigurationsApiClient.getBnConfigurationsClient()
      clientConfigurations.value = configurations
      configClientLoaded.value = true
    } finally {
      fetchingConfigurations.value.client = false
    }
  }

  const addDemarches = async (idDs: number | null, identification?: IdentificationDemarcheKey | null, types?: OrganismeTypeKey[]) => {
    if (!idDs) {
      throw new Error('id DS non saisi')
    }
    const dto = {
      idDs,
    } as ICreateDemarche

    if (identification) {
      dto.identification = identification
    }
    if (types) {
      dto.types = types
    }
    fetching.value = true
    try {
      await createDemarche(dto)
      await loadDemarches()
    } finally {
      fetching.value = false
    }
  }

  const addBnConfigurations = async (keyName: string, stringValue: string, valueType: string) => {
    if (!keyName) {
      throw new Error('Nom de la configuration non saisi')
    }
    if (!stringValue) {
      throw new Error('Valeur de la configuration non saisi')
    }
    if (!valueType) {
      throw new Error('Type de valeur non saisi')
    }
    const dto = {
      keyName,
      stringValue,
      valueType,
    } as ICreateBnConfiguration
    fetchingConfigurations.value.bn = true
    try {
      await bnConfigurationsApiClient.createBnConfiguration(dto)
      await loadBnConfigurations()
    } finally {
      fetchingConfigurations.value.bn = false
    }
  }

  const synchronizeOneDemarche = async (demarcheId: number | null) => {
    if (!demarcheId) {
      throw new Error('id non saisi')
    }
    fetching.value = true
    try {
      await putSynchronizeOneDemarche(demarcheId)
    } finally {
      fetching.value = false
    }
  }

  const updateDemarche = async (idDs: number | null, identification?: IdentificationDemarcheKey | null, types?: OrganismeTypeKey[]) => {
    if (!idDs) {
      throw new Error('id DS non saisi')
    }
    const dto: IUpdateDemarche = { types }
    if (identification !== undefined) {
      dto.identification = identification
    }
    const demarche = demarches.value.find((d) => d.dsId === idDs)
    if (!demarche) {
      throw new Error(`Démarche ${idDs} non trouvée`)
    }
    fetching.value = true
    try {
      await patchDemarche(demarche.id, dto)
      await loadDemarches()
    } finally {
      fetching.value = false
    }
  }

  const updateBnConfigurations = async (id: number | undefined, keyName: string, stringValue: string, valueType: string) => {
    if (id === undefined) {
      throw new Error('id non saisi')
    }
    const dto = {
      keyName,
      stringValue,
      // @ts-ignore TODO: corriger le type
      valueType,
    } as IUpdateBnConfiguration
    fetchingConfigurations.value.bn = true
    try {
      await bnConfigurationsApiClient.updateBnConfiguration(id, dto)
      await Promise.all([
        loadBnConfigurations(),
        loadClientConfigurations(),
      ])
    } finally {
      fetchingConfigurations.value.bn = false
    }
  }

  const softDeleteDemarche = async (id: number) => {
    fetching.value = true
    try {
      await demarchesApiClient.softDeleteDemarche(id)
      await loadDemarches()
    } finally {
      fetching.value = false
    }
  }

  const $reset = () => {
    demarches.value = []
    fetching.value = false
    bnConfigurations.value = []
    clientConfigurations.value = []
    fetchingConfigurations.value = { bn: false, client: false }
    configClientLoaded.value = false
  }

  const fixOrganismes = async (demarcheId: number | null) => {
    if (!demarcheId) {
      throw new Error('id non saisi')
    }
    fetching.value = true
    try {
      await patchToFixOrganismeByDemarche(demarcheId)
    } finally {
      fetching.value = false
    }
  }

  return {
    $reset,
    demarches,
    bnConfigurations,
    clientConfigurations,
    fetching,
    fetchingConfigurations,
    configClientLoaded,
    configMap,
    isAssociationsEnabled,
    getConfig,
    loadDemarches,
    loadBnConfigurations,
    loadClientConfigurations,
    addDemarches,
    addBnConfigurations,
    synchronizeOneDemarche,
    updateDemarche,
    updateBnConfigurations,
    softDeleteDemarche,
    fixOrganismes,
  }
})
