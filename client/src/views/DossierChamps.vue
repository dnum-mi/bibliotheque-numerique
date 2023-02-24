<script lang="ts" setup>
import DossierChamp from './DossierChamp.vue'
withDefaults(defineProps<{
    champs?: object[]
  }>(), {
  champs: () => ([]),
})

const dataCy = 'dossier-champs'
</script>>
<template>
  <div class="fr-container">
    <div
      v-if="champs"
      :data-cy="dataCy"
    >
      <div class="fr-grid-row">
        <span
          v-for="champ in champs"
          :key="champ.id"
          class="fr-col-12 fr-grid-row"
        >
          <DossierChamp :champ="champ" />
        </span>
      </div>
    </div>
  </div>
</template>
