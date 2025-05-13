<script lang="ts" setup>
import DossierChamps from './DossierChamps.vue'
import DownloadFile from '@/components/DownloadFile.vue'
import type { ChampWithDescriptor } from './composables/useGroupedChamps'

defineProps<{
  champ: ChampWithDescriptor
}>()
</script>

<template>
  <div
    v-if="champ"
    data-cy="dossier-champ"
    class="fr-col-12 fr-py-2v fr-px-4v"
  >
    <div>
      <!-- LABEL -->
      <label
        :for="champ.id"
        class="bn-champ--text"
      >
        {{ champ.label }}
      </label>
      <!-- SI Piece jointe -->
      <div
        v-if="champ.__typename === 'PieceJustificativeChamp'"
        :id="champ.id"
        class="fr-text--bold fr-text bn-champ--text flex flex-col"
      >
        <!-- {{ champ }} -->
        <div
          v-for="(file, index) in champ.files"
          :key="index"
        >
          <DownloadFile :file="file" />
        </div>
      </div>

      <!-- Si boolean -->
      <div
        v-if="champ.__typename === 'CheckboxChamp'"
        :id="champ.id"
        class="fr-text--bold fr-text bn-champ--text"
      >
        <p>{{ champ.stringValue === 'true' ? 'Oui' : 'Non' }}</p>
      </div>

      <!-- SI Repetable -->
      <div
        v-else-if="champ.__typename === 'RepetitionChamp'"
        class="fr-background-alt--grey fr-p-3v"
      >
        <DossierChamps :champs="champ.champs" />
      </div>

      <!-- Par défault -->
      <div
        v-else
        :id="champ.id"
        class="fr-text--bold fr-text"
      >
        <p>{{ champ.stringValue }}</p>
      </div>
    </div>
  </div>
</template>
