<script lang="ts" setup>
import { useDemarcheStore } from '@/stores'
import type { anonymisationEventKey } from '@biblio-num/shared'
import { anonymisationEvents, eAnonymisationEvent } from '@biblio-num/shared'

import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useField } from 'vee-validate'
import SelectAnonymousChamps from './SelectAnonymousChamps.vue'

const demarcheStore = useDemarcheStore()
const isOnAllDossiersOfOrganisme = ref(false)

const anonymizationEventSelected = ref<anonymisationEventKey | null>(null)
const maxNbMonth = 2147483647
const { value: nbrMonthAnonymisation, errorMessage: nbMonthError, validate } = useField<number>('nbMonth', toTypedSchema(z.number().min(0, 'Nous ne prennons que des nombre de mois positif')
  .max(maxNbMonth, `Le nombre de mois ne doit pas dépasser ${maxNbMonth}`)))

onMounted(async () => {
  await demarcheStore.getCurrentDemarcheOptions()
  nbrMonthAnonymisation.value = demarcheStore.currentDemarcheOptions?.nbrMonthAnonymisation ?? 0
  anonymizationEventSelected.value = demarcheStore.currentDemarcheOptions?.anonymizationEvent ?? null
  isOnAllDossiersOfOrganisme.value = demarcheStore.currentDemarcheOptions?.isOnAllDossiersOfOrganisme ?? false
})

const saveOption = () => {
  if (nbMonthError.value) {
    return
  }
  demarcheStore.saveDemarcheOptions({
    nbrMonthAnonymisation: nbrMonthAnonymisation.value,
    anonymizationEvent: (anonymizationEventSelected.value as string) === 'null' ? null : anonymizationEventSelected.value,
    isOnAllDossiersOfOrganisme: isOnAllDossiersOfOrganisme.value,
  })
}
const anonymizationEventList = [
  {
    text: 'Déactiver l\'anonymisation',
    value: 'null',
  },
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

const isEnabledAnonymize = computed(() => (!!demarcheStore.currentDemarcheOptions?.anonymizationEvent && !!demarcheStore.currentDemarcheOptions?.nbrMonthAnonymisation))
const enabledAnonymize = computed(() => (anonymisationEvents.includes(anonymizationEventSelected.value as unknown as anonymisationEventKey)))
const onUpdateAnonymizationEvent = async (event) => {
  if (anonymisationEvents.includes(event)) {
    if (!nbrMonthAnonymisation.value) {
      nbrMonthAnonymisation.value = 72
    }
  } else {
    nbrMonthAnonymisation.value = 0
  }

  await saveOption()
}

const onUpdateNbMonth = async (nb: string) => {
  nbrMonthAnonymisation.value = Number(nb) || 0
  await validate()
  await saveOption()
}
</script>

<template>
  <div
    class="flex justify-center items-center font-bold text-lg h-6 pb-6"
  >
    <span v-if="isEnabledAnonymize" class="fr-icon-check-line text-green-9">L'opération d'anoymisation est active pour tous les dossiers de cette démarche</span>
    <span v-else class="fr-icon-close-line text-amber"> L'opération d'anoymisation est en arrete pour tous les dossiers de cette démarche</span>
  </div>
  <div class="flex flex-col mb-10">
    <!-- NBR MONTH ANONYMISATION  -->
    <div class="flex flex-row gap-10 align-baseline">
      <DsfrSelect
        v-model="anonymizationEventSelected"
        label="Sélectionner le declencheur d'un anonymisation"
        :options="anonymizationEventList"
        @update:model-value="onUpdateAnonymizationEvent"
      />

      <DsfrInputGroup
        v-model="nbrMonthAnonymisation"
        type="number"
        label="Nombres de mois avant anonymisation"
        label-visible
        :disabled="!enabledAnonymize"
        :max="maxNbMonth"
        min="0"
        :is-valid="nbMonthError"
        :error-message="nbMonthError"
        @update:model-value="onUpdateNbMonth"
      />

      <div class="content-center ml-auto">
        <DsfrCheckbox
          v-model="isOnAllDossiersOfOrganisme"
          label="Appliquer à tous les dossiers de l'organisme"
          name="onAllDossierOfOrganisme"
          :disabled="!enabledAnonymize"
          @update:model-value="saveOption"
        />
      </div>
    </div>
  </div>
  <div v-if="isEnabledAnonymize">
    <hr>

    <SelectAnonymousChamps />
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
