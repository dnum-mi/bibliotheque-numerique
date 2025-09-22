<script lang="ts" setup>
import { buildRecord, eIdentificationDemarche } from '@biblio-num/shared'
import type { IdentificationDemarcheKey, IMappingColumn } from '@biblio-num/shared'
import DemarcheConfigurationCommon from './DemarcheConfigurationsCommon.vue'
import { useDemarcheStore } from '@/stores'

const defaultDemarcheTitle = 'Champs Démarche Simplifiée'
const demarcheTitleConfig: Record<IdentificationDemarcheKey, string> = buildRecord([
  [[eIdentificationDemarche.MAARCH], 'Champs Maarch'],
  [[eIdentificationDemarche.FE, eIdentificationDemarche.DDC], defaultDemarcheTitle],
])

const demarcheStore = useDemarcheStore()
const demarcheConfiguration = computed<IMappingColumn[]>(() => demarcheStore.currentDemarcheConfiguration)
const currentDemarcheKey = computed<IdentificationDemarcheKey | null>(() => {
  const id = demarcheStore.currentDemarche?.identification
  if (id && Object.values(eIdentificationDemarche).includes(id as IdentificationDemarcheKey)) {
    return id as IdentificationDemarcheKey
  }
  return null
})
const demarcheTitle = computed(() => {
  if (!currentDemarcheKey.value) {
    return defaultDemarcheTitle
  }
  return demarcheTitleConfig[currentDemarcheKey.value] ?? defaultDemarcheTitle
})

const saveOne = async (event: { id: string, label: string | null }) => {
  await demarcheStore.updateOneMappingColumn(event.id, event.label)
}
</script>

<template>
  <DemarcheConfigurationCommon
    :current-demarche-configuration="demarcheConfiguration"
    :is-selected-fn="(ch) => !!ch.columnLabel"
    :demarche-title="demarcheTitle"
    @save-one="saveOne"
  />
</template>
