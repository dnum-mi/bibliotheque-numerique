<script lang="ts" setup>
import DossierChamps from './DossierChamps.vue'
import DownloadFile from '@/components/DownloadFile.vue'
import type { ChampWithDescriptor } from './composables/useGroupedChamps'

const props = defineProps<{
  champ: ChampWithDescriptor
}>()

const champType = computed(() => {
  return props.champ.__typename
})
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
        v-if="champType !== 'RepetitionChamp'"
        class="bn-champ--text"
      >
        {{ champ.label }}
      </label>
      <!-- SI Piece jointe -->
      <template v-if="champType === 'PieceJustificativeChamp'">
        <div
          :id="champ.id"
          class="fr-text--bold fr-text bn-champ--text flex flex-col fr-pb-2w"
        >
          <!-- {{ champ }} -->
          <div
            v-for="(file, index) in champ.files"
            :key="index"
          >
            <DownloadFile :file="file" />
          </div>
        </div>
      </template>

      <!-- Si boolean -->
      <p
        v-else-if="champType === 'CheckboxChamp'"
        :id="champ.id"
        class="fr-text--bold fr-text bn-champ--text"
      >
        {{ champ.stringValue === 'true' ? 'Oui' : 'Non' }}
      </p>

      <!-- SI Repetable -->
      <template v-else-if="champType === 'RepetitionChamp'">
        <div
          class="fr-background-alt--grey fr-p-2w fr-my-3w fr-ml-1w"
          v-for="(row, idx) in champ.rows"
          :key="idx"
        >
          <p class="fr-text--bold">{{ champ.label }} {{ champ.rows.length > 1 ? idx + 1 : '' }} :</p>
          <DossierChamps :champs="row.champs" />
        </div>
      </template>

      <!-- Par défault -->
      <p
        v-else
        :id="champ.id"
        class="fr-text--bold fr-text"
      >
        {{ champ.stringValue }}
      </p>
    </div>
  </div>
</template>
