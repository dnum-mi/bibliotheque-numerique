<script lang="ts" setup>
import { dateTimeToStringFr } from '@/utils/dateToString'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
    datas?: object
  }>(), {
  datas: () => ({}),
})

const prefecture = computed(() => props.datas.groupeInstructeur?.label.toUpperCase() || '')
const depot = computed(() => dateTimeToStringFr(props.datas.dateDepot) || '')
const intruction = computed(() => dateTimeToStringFr(props.datas.datePassageEnInstruction) || '')
const publication = computed(() => '')
const etat = computed(() => props.datas?.state?.toUpperCase() || '')
</script>

<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col-2">
        <label class="bn-fiche-sub-title--label">PRÉFECTURE</label>
        <span class="bn-fiche-sub-title--text">{{ prefecture }}</span>
      </div>
      <div class="fr-col-2">
        <label class="bn-fiche-sub-title--label">DÉPÔT</label>
        <span class="bn-fiche-sub-title--text">{{ depot }}</span>
      </div>
      <div class="fr-col-2">
        <label class="bn-fiche-sub-title--label">INTRUCTION</label>
        <span class="bn-fiche-sub-title--text">{{ intruction }}</span>
      </div>
      <div class="fr-col-2">
        <label class="bn-fiche-sub-title--label">PUBLICATION</label>
        <span class="bn-fiche-sub-title--text">{{ publication }}</span>
      </div>
      <div class="fr-col-2">
        <label class="bn-fiche-sub-title--label">ÉTAT</label>
        <span class="bn-fiche-sub-title--text fr-badge fr-badge--info fr-badge--no-icon">{{ etat }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fr-container {
  padding: 0;
}
</style>
