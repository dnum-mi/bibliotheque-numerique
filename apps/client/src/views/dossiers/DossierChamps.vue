<script lang="ts" setup>
import type { Champ } from '@biblio-num/shared'

import DossierChamp from './DossierChamp.vue'

defineProps<{
    champs?: Champ[]
}>()
</script>

<template>
  <div class="fr-container">
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
  </div>
</template>
