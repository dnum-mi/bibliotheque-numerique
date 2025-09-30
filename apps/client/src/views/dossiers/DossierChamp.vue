<script lang="ts" setup>
import type { IFieldRepetable, IFieldSimple, FieldFileType } from '@biblio-num/shared'
import DossierChamps from './DossierChamps.vue'
import DownloadFile from '@/components/DownloadFile.vue'

defineProps<{
  champ: IFieldSimple | IFieldRepetable
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
      <template v-if="champ.type === 'file'">
        <div
          :id="champ.id"
          class="fr-text--bold fr-text bn-champ--text flex flex-col fr-pb-2w"
        >
          <template v-if="champ.value">
            <div
              v-for="(file, index) in (champ.value as FieldFileType).files"
              :key="index"
            >
              <DownloadFile :file="file" />
            </div>
          </template>
        </div>
      </template>

      <!-- Si boolean -->
      <p
        v-else-if="champ.type === 'boolean'"
        :id="champ.id"
        class="fr-text--bold fr-text bn-champ--text"
      >
        {{ (champ as IFieldSimple).value ? 'Oui' : 'Non' }}
      </p>

      <!-- SI Repetable -->
      <template v-else-if="champ.type === 'group'">
        <div
          v-for="(row, idx) in (champ as IFieldRepetable).rows"
          :key="idx"
          class="fr-background-alt--grey fr-p-2w fr-my-3w fr-ml-1w"
        >
          <DossierChamps :champs="row" />
        </div>
      </template>

      <!-- Par défault -->
      <p
        v-else
        :id="champ.id"
        class="fr-text--bold fr-text"
      >
        {{ (champ as IFieldSimple).value }}
      </p>
    </div>
  </div>
</template>
