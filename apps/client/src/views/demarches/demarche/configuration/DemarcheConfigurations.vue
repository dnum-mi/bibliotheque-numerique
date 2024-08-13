<script lang="ts" setup>
import type { IMappingColumn } from '@biblio-num/shared'
import demarcheConfigurationVue from './DemarcheConfigurationsCommon.vue'
import { useDemarcheStore } from '@/stores'

const demarcheStore = useDemarcheStore()
const demarcheConfiguration = computed<IMappingColumn[]>(() => demarcheStore.currentDemarcheConfiguration)

const saveOne = async (event: { id: string, label: string | null }) => {
  await demarcheStore.updateOneMappingColumn(event.id, event.label)
}
</script>

<template>
  <demarcheConfigurationVue
    :current-demarche-configuration="demarcheConfiguration"
    :is-selected-fn="(ch) => !!ch.columnLabel"
    @save-one="saveOne"
  />
</template>
