<script lang="ts" setup>
import { FieldSource, type IMappingAnonymizedChamp, type IMappingColumn } from '@biblio-num/shared'
import demarcheConfigurationVue from '../configuration/DemarcheConfigurationsCommon.vue'
import { useDemarcheStore } from '@/stores'
import DemarcheConfigurationSelectedItem from '../configuration/DemarcheConfigurationSelectedItem.vue'

const demarcheStore = useDemarcheStore()
const demarcheConfiguration = computed<IMappingColumn[]>(() => demarcheStore.currentDemarcheConfiguration.filter(dc => dc.source !== FieldSource.fixField))
const selectedAnonymized = computed<string[]>(() =>
  demarcheStore.currentAnonymizedChamps.flatMap(ch => ch.children ? ch.children?.map(child => child.id) : [ch.id]),
)

const selectedAnonymizedNotInMappingColumn = computed<IMappingAnonymizedChamp[]>(() => {
  const listIds = demarcheStore.currentDemarcheConfiguration.flatMap(cdc => [cdc.id, cdc.children?.map(ch => ch.id) || []])
  const newSelected = demarcheStore.currentAnonymizedChamps.flatMap(ch => ch.children ? ch.children?.map(child => child) : [ch])
  return newSelected.filter(ch => !listIds.includes(ch.id))
})
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
    selected-title="Champs sélectionnés pour l'anonymisation"
    @save-one="saveOne"
  >
    <template v-if="selectedAnonymizedNotInMappingColumn.length" #otherSelected>
      <div class="fr-mb-4w">
        <h5 class="fr-ml-2w  fr-mb-1v  text-[var(--blue-france-sun-113-625)]  fr-text--md">
          Champs qui ont été supprimé de la démarche
        </h5>

        <template
          v-for="champ of selectedAnonymizedNotInMappingColumn"
          :key="champ.id"
        >
          <div
            class="fr-pl-6w  fr-my-2w  flex  justify-between  items-center"
          >
            <DemarcheConfigurationSelectedItem
              :champ="champ"
              :can-change-label="false"
              @remove="saveOne({ id: champ.id, label: null })"
            />
          </div>
        </template>
      </div>
    </template>
  </demarcheConfigurationVue>
</template>
