import { defineStore } from 'pinia'
import { ref } from 'vue'

import type {
  CreateDemarcheDto,
  IdentificationDemarcheKeys,
  OrganismeTypeKeys,
  SmallDemarcheOutputDto,
  UpdateDemarcheDto,
} from '@biblio-num/shared'
import { demarchesApiClient } from '../api/api-client'
import { createDemarche, patchDemarche, synchronizeDossiers } from '../api/sudo-api-client'

export const useConfigurationStore = defineStore('Configuration', () => {
  const demarches = ref<SmallDemarcheOutputDto[]>([])
  const fetching = ref<boolean>(false)
  const loadDemarches = async () => {
    fetching.value = true
    demarches.value = await demarchesApiClient.getSmallDemarches()
    fetching.value = false
    return demarches.value
  }

  const addDemarches = async (idDs: number|null, identification?: IdentificationDemarcheKeys | null, types?: OrganismeTypeKeys[]) => {
    if (!idDs) throw new Error('id DS non saisi')

    const dto: CreateDemarcheDto = {
      idDs,
    } as CreateDemarcheDto
    if (identification) dto.identification = identification
    if (types) dto.types = types
    fetching.value = true
    await createDemarche(dto).finally(() => { fetching.value = false })
    await loadDemarches().finally(() => { fetching.value = false })
  }

  const synchroDossiers = async (idDs: number|null) => {
    if (!idDs) throw new Error('id DS non saisi')
    fetching.value = true
    await synchronizeDossiers(idDs).finally(() => { fetching.value = false })
  }

  const updateDemarche = async (idDs: number|null, identification?: IdentificationDemarcheKeys | null, types?: OrganismeTypeKeys[]) => {
    if (!idDs) throw new Error('id DS non saisi')
    const dto: UpdateDemarcheDto = {
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

  return {
    demarches,
    fetching,
    loadDemarches,
    addDemarches,
    synchroDossiers,
    updateDemarche,
  }
})
