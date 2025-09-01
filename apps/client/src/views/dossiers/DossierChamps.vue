<script lang="ts" setup>
import type { ChampWithDescriptor } from './composables/useGroupedChamps'
import DossierChamp from './DossierChamp.vue'

defineProps<{
  champs?: ChampWithDescriptor[]
}>()
</script>

<template>
  <div
    v-if="champs"
    data-cy="dossier-champs"
  >
    <div class="fr-grid-row">
      <DossierChamp
        v-for="(champ, idx) in champs"
        :key="idx"
        :champ="champ"
      />
    </div>
  </div>
</template>
