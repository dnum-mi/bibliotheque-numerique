<script lang="ts" setup>
import type { File } from '@dnum-mi/ds-api-client'

defineProps<{
  files: Array<File>
}>()

// @ts-ignore TODO: Impossible de trouver getIconNameFromFilename dans la lib, comme c'était avant ?
function getIconNameFromFilename (str: string) {
  return `ri-cancel-${str}`
}
</script>

<template>
  <div>
    <ol class="fr-list">
      <li
        v-for="file of files"
        :key="`${file.filename}-${file.byteSizeBigInt}`"
      >
        <a
          :href="file.url"
          class="fr-mr-2v"
        >
          <VIcon
            class="fr-mr-1v"
            :name="getIconNameFromFilename(file.filename)"
            fill="var(--blue-france-sun-113-625)"
          />

          {{ file.filename }}
        </a>
        <span class="font-italic text-[var(--grey-425-625)] text-sm"> {{ (file.byteSizeBigInt / 1024).toFixed(1) }} ko </span>
      </li>
    </ol>
  </div>
</template>
