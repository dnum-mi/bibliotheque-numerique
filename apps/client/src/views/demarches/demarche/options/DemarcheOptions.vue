<script lang="ts" setup>
import { useDemarcheStore } from '@/stores'

const demarcheStore = useDemarcheStore()

const nbrMonthAnonymisationString = ref('')
const nbrMonthAnonymisation = computed(() => Number(nbrMonthAnonymisationString.value) ?? 0)

onMounted(async () => {
  await demarcheStore.getCurrentDemarcheOptions()
  nbrMonthAnonymisationString.value = `${demarcheStore.currentDemarcheOptions?.nbrMonthAnonymisation}` ?? ''
})

const saveOption = () => {
  demarcheStore.saveDemarcheOptions({ nbrMonthAnonymisation: nbrMonthAnonymisation.value })
}
</script>

<template>
  <div class="flex flex-col mb-10">
    <!-- NBR MONTH ANONYMISATION  -->
    <div class="flex flex-row items-center gap-2 m-1">
      <div class="width-200">
        <DsfrInput
          v-model="nbrMonthAnonymisationString"
          type="number"
        />
      </div>
      <div class="flex-grow mt-2">
        Nombres de mois avant anonymisation
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
