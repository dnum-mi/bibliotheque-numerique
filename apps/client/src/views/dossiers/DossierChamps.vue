<script lang="ts" setup>
import type { IFieldRepetable, IFieldSimple } from '@biblio-num/shared'
import DossierChamp from './DossierChamp.vue'

defineProps<{
  champs?: (IFieldSimple | IFieldRepetable)[]
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
