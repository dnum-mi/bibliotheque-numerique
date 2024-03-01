import { bnConfigurationsApiClient, demarchesApiClient } from '../api/api-client'
import type {
  IBnConfigurationOutput,
  ICreateBnConfiguration,
  ICreateDemarche,
  ISmallDemarcheOutput,
  IUpdateBnConfiguration,
  IUpdateDemarche,
  IdentificationDemarcheKeys,
  OrganismeTypeKeys,
} from '@biblio-num/shared'

import { createDemarche, patchDemarche, putSynchronizeOneDemarche } from '../api/sudo-api-client'

export const useConfigurationStore = defineStore('Configuration', () => {
  const bnConfigurations = ref<IBnConfigurationOutput[]>([])
  const demarches = ref<ISmallDemarcheOutput[]>([])
  const fetching = ref<boolean>(false)
  const fetchingBnConfigurations = ref<boolean>(false)

  const loadDemarches = async () => {
    fetching.value = true
    demarches.value = await demarchesApiClient.getSmallDemarches()
    fetching.value = false
    return demarches.value
  }

  const loadBnConfigurations = async () => {
    fetchingBnConfigurations.value = true
    bnConfigurations.value = await bnConfigurationsApiClient.getBnConfigurations()
    fetchingBnConfigurations.value = false
    return bnConfigurations.value
  }

  const addDemarches = async (idDs: number|null, identification?: IdentificationDemarcheKeys | null, types?: OrganismeTypeKeys[]) => {
    if (!idDs) throw new Error('id DS non saisi')

    const dto: ICreateDemarche = {
      idDs,
    } as ICreateDemarche
    if (identification) dto.identification = identification
    if (types) dto.types = types
    fetching.value = true
    await createDemarche(dto).finally(() => { fetching.value = false })
    await loadDemarches().finally(() => { fetching.value = false })
  }

  const addBnConfigurations = async (keyName: string, stringValue: string, valueType: string) => {
    if (!keyName) throw new Error('Nom de la configuration non saisi')
    if (!stringValue) throw new Error('Valeur de la configuration non saisi')
    if (!valueType) throw new Error('Type de valeur non saisi')
    const dto: ICreateBnConfiguration = {
      keyName,
      stringValue,
      valueType,
    }
    fetchingBnConfigurations.value = true
    await bnConfigurationsApiClient.createBnConfiguration(dto).finally(() => { fetchingBnConfigurations.value = false })
    await loadBnConfigurations().finally(() => { fetchingBnConfigurations.value = false })
  }

  const synchronizeOneDemarche = async (demarcheId: number|null) => {
    if (!demarcheId) throw new Error('id non saisi')
    fetching.value = true
    await putSynchronizeOneDemarche(demarcheId).finally(() => { fetching.value = false })
  }

  const updateDemarche = async (idDs: number|null, identification?: IdentificationDemarcheKeys | null, types?: OrganismeTypeKeys[]) => {
    if (!idDs) throw new Error('id DS non saisi')
    const dto: IUpdateDemarche = {
      types,
    }
    if (identification !== undefined) {
      dto.identification = identification
    }
    const demarche = demarches.value.find((d) => d.dsId === idDs)
    if (!demarche) throw new Error(`Démarche ${idDs} non trouvée`)
    fetching.value = true
    await patchDemarche(demarche.id, dto).finally(() => { fetching.value = false })
    await loadDemarches().finally(() => { fetching.value = false })
  }

  const updateBnConfigurations = async (id: number|undefined, keyName: string, stringValue: string, valueType: string) => {
    if (id === undefined) throw new Error('id non saisi')
    const dto: IUpdateBnConfiguration = {
      keyName,
      stringValue,
      valueType,
    }
    fetchingBnConfigurations.value = true
    await bnConfigurationsApiClient.updateBnConfiguration(id, dto).finally(() => { fetchingBnConfigurations.value = false })
    await loadBnConfigurations().finally(() => { fetchingBnConfigurations.value = false })
  }

  const softDeleteDemarche = async (id: number) => {
    fetching.value = true
    await demarchesApiClient.softDeleteDemarche(id).finally(() => { fetching.value = false })
    await loadDemarches().finally(() => { fetching.value = false })
  }

  const $reset = () => {
    demarches.value = []
    fetching.value = false
  }

  return {
    $reset,
    demarches,
    bnConfigurations,
    fetching,
    fetchingBnConfigurations,
    loadDemarches,
    loadBnConfigurations,
    addDemarches,
    addBnConfigurations,
    synchronizeOneDemarche,
    updateDemarche,
    updateBnConfigurations,
    softDeleteDemarche,
  }
})
