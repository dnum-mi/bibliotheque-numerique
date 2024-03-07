<script lang="ts" setup>
import type { PieceJustificativeChamp, RepetitionChamp } from '@dnum-mi/ds-api-client'

import DossierChamps from './DossierChamps.vue'
import DownloadFile from '@/components/DownloadFile.vue'

defineProps<{
  champ: PieceJustificativeChamp & RepetitionChamp;
}>()
</script>

<template>
  <div
    v-if="champ"
    data-cy="dossier-champ"
    class="fr-mb-1w fr-col-12"
  >
    <hr class="fr-mt-3w fr-pb-1w">
    <div class="fr-mx-7w">
      <!-- LABEL -->
      <label
        :for="champ.id"
        class="fr-text--bold fr-text--lg bn-champ--text"
      >
        {{ champ.label }}
      </label>
      <!-- SI Piece jointe -->
      <div
        v-if="champ.__typename == 'PieceJustificativeChamp'"
        :id="champ.id"
        class="fr-text fr-mt-1w bn-champ--text flex flex-col"
      >
        <!-- {{ champ }} -->
        <div
          v-for="(file, index) in champ.files"
          :key="index"
        >
          <DownloadFile
            :file="file"
          />
        </div>
      </div>
      <!-- SI Repetable -->
      <DossierChamps
        v-else-if="champ.__typename == 'RepetitionChamp'"
        :champs="champ.champs"
      />
      <!-- Si boolean -->
      <div
        v-if="champ.__typename == 'CheckboxChamp'"
        :id="champ.id"
        class="fr-text fr-mt-1w bn-champ--text"
      >
        {{ champ.stringValue === "true" ? "Oui" : "Non" }}
      </div>

      <!-- Par défault -->
      <div
        v-else
        :id="champ.id"
        class="fr-text fr-mt-1w bn-champ--text"
      >
        {{ champ.stringValue }}
      </div>
    </div>
  </div>
</template>
