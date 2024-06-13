<script lang="ts" setup>
import { useDemarcheStore } from '@/stores'
import type { anonymisationEventKey } from '@biblio-num/shared'
import { eAnonymisationEvent } from '@biblio-num/shared'

const demarcheStore = useDemarcheStore()

const nbrMonthAnonymisationString = ref('')
const nbrMonthAnonymisation = computed(() => Number(nbrMonthAnonymisationString.value) ?? 0)

onMounted(async () => {
  await demarcheStore.getCurrentDemarcheOptions()
  nbrMonthAnonymisationString.value = `${demarcheStore.currentDemarcheOptions?.nbrMonthAnonymisation}` ?? ''
  anonymizationEventSelected.value = demarcheStore.currentDemarcheOptions?.anonymizationEvent ?? eAnonymisationEvent.DepotDate
  isOnAllDossiersOfOrganisme.value = demarcheStore.currentDemarcheOptions?.isOnAllDossiersOfOrganisme ?? false
})

const saveOption = () => {
  demarcheStore.saveDemarcheOptions({
    nbrMonthAnonymisation: nbrMonthAnonymisation.value,
    anonymizationEvent: anonymizationEventSelected.value,
    isOnAllDossiersOfOrganisme: isOnAllDossiersOfOrganisme.value,
  })
}
const anonymizationEventList = [
  {
    text: 'Aprés le dépot',
    value: eAnonymisationEvent.DepotDate,
  },
  {
    text: 'Aprés la décision',
    value: eAnonymisationEvent.DecisionDate,
  },
  {
    text: 'Aprés l\'acceptation',
    value: eAnonymisationEvent.AcceptedDate,
  },
]
const anonymizationEventSelected = ref<anonymisationEventKey>(eAnonymisationEvent.DepotDate)
const isOnAllDossiersOfOrganisme = ref(false)
</script>

<template>
  <div class="flex flex-col mb-10">
    <!-- NBR MONTH ANONYMISATION  -->
    <div class="flex flex-row gap-10 align-baseline">
      <DsfrInputGroup
        v-model="nbrMonthAnonymisationString"
        type="number"
        label="Nombres de mois avant anonymisation"
        label-visible
      />
      <DsfrSelect
        v-model="anonymizationEventSelected"
        label="Sélectionner le declencheur d'un anonymisation"
        :options="anonymizationEventList"
      />
      <div class="content-center ml-auto">
        <DsfrCheckbox
          v-model="isOnAllDossiersOfOrganisme"
          label="Appliquer à tous les dossiers d'organisme"
          name="onAllDossierOfOrganisme"
        />
      </div>
    </div>

    <!-- SAVE BUTTON  -->
    <div class="flex flex-row items-center justify-right gap-2 m-2">
      <DsfrButton
        type="button"
        label="Sauvegarder"
        tertiary
        @click="saveOption()"
      />
    </div>
  </div>
</template>

<style scoped>
.button-text-xs {
  font-size: 0.875rem;
}

:deep(.fr-badge) {
  --text-default-grey: var(--grey-625-425);
}

.tabpane {
  position: relative;
  opacity: 0;
  max-height: 0;
  top: 1rem;
}

.active {
  display: block;
  opacity: 1;
  transition: all 0.5s ease;
  max-height: none;
  top: 0;
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
