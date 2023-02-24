<script lang="ts" setup>
import DossierChamps from './DossierChamps.vue'
withDefaults(defineProps<{
    champ?: object[]
  }>(), {
  champ: () => ([]),
})

const dataCy = 'dossier-champ'
</script>>
<template>
  <div
    v-if="champ"
    :data-cy="dataCy"
  >
    <label
      :for="champ.id"
      class="fr-text--bold fr-col-6"
    > {{ champ.label }} : </label>

    <span
      v-if="champ.__typename =='PieceJustificativeChamp' "
      :id="champ.id"
      class="fr-text fr-col-6"
    > <a
      :href=" champ.file.url"
      target="_blank"
    >{{ champ.file.filename }}</a>
    </span>
    <DossierChamps
      v-else-if="champ.__typename =='RepetitionChamp' "
      :champs="champ.champs"
    />
    <span
      v-else
      :id="champ.id"
      class="fr-text fr-col-6"
    > {{ champ.stringValue }}</span>
  </div>
</template>
