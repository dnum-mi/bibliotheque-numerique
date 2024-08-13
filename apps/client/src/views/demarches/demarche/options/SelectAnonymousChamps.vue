<script lang="ts" setup>
import type { IMappingAnonymizedChamp, IMappingColumn } from '@biblio-num/shared'
import demarcheConfigurationVue from '../configuration/DemarcheConfigurationsCommon.vue'
import { useDemarcheStore } from '@/stores'

const demarcheStore = useDemarcheStore()
const demarcheConfiguration = computed<IMappingColumn[]>(() => demarcheStore.currentDemarcheConfiguration)
const selectedAnonymized = computed<string[]>(() =>
  demarcheStore.currentAnonymizedChamps.flatMap(ch => ch.children ? ch.children?.map(child => child.id) : [ch.id]),
)
const saveOne = async (event: { id: string, label: string | null }) => {
  await demarcheStore.updateOneMappingAnonymizedChamp(event.id, event.label)
}

onMounted(async () => {
  await demarcheStore.getAnonymizedChamps()
})
</script>

<template>
  <demarcheConfigurationVue
    :current-demarche-configuration="demarcheConfiguration"
    :is-selected-fn="(ch: IMappingAnonymizedChamp) => selectedAnonymized.includes(ch.id)"
    :can-change-label="false"
    @save-one="saveOne"
  />
</template>
