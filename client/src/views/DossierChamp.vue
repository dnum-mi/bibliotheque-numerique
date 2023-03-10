<script lang="ts" setup>
import DossierChamps from './DossierChamps.vue'
import { prettyByteSizeByString } from '../utils/prettyByteSize'

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
    class="fr-mb-2w fr-col-12"
  >
    <hr class="fr-mt-3w fr-pb-1w">
    <label
      :for="champ.id"
      class="fr-text--bold fr-text--lg bn-champ--text"
    > {{ champ.label }}</label>

    <div
      v-if="champ.__typename =='PieceJustificativeChamp' "
      :id="champ.id"
      class="fr-text fr-mt-1w bn-champ--text"
    >
      <a
        :href=" champ.file.url"
        target="_blank"
      >{{ champ.file.filename }} <span class="fr-text--xs">({{ prettyByteSizeByString(champ.file.byteSizeBigInt) }})</span></a>
    </div>
    <DossierChamps
      v-else-if="champ.__typename =='RepetitionChamp' "
      :champs="champ.champs"
    />
    <div
      v-else
      :id="champ.id"
      class="fr-text fr-mt-1w bn-champ--text"
    >
      {{ champ.stringValue }}
    </div>
  </div>
</template>
