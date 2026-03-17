<script lang="ts" setup>
import { ref } from 'vue'

import SearchOrganismeInput from './search/SearchOrganismeInput.vue'
import SearchOrganismeById from './search/SearchOrganismeById.vue'

const searchMode = ref<'fulltext' | 'id'>('id')

//#region 📍------ Reset ID & modes ------ 📍
const setModeFulltext = () => {
  searchMode.value = 'fulltext'
}

const setModeId = () => {
  searchMode.value = 'id'
}
//#endregion
</script>

<template>
  <LayoutList
    title="Rechercher dans le référentiel des associations et des fondations"
    title-bg-color="var(--border-plain-grey)"
    title-icon="fr-icon-search-line"
  >
    <div class="p-8 max-w-5xl mx-auto">
      <!-- Sélecteur de mode -->
      <div class="bn-search-modes fr-mb-4w">
        <button
          type="button"
          class="bn-search-mode"
          :class="{ 'bn-search-mode--active': searchMode === 'id' }"
          @click="setModeId"
        >
          Recherche par identifiant
        </button>

        <button
          type="button"
          class="bn-search-mode"
          :class="{ 'bn-search-mode--active': searchMode === 'fulltext' }"
          @click="setModeFulltext"
        >
          Recherche plein texte
        </button>
      </div>

      <!-- MODE 1 : PLEIN TEXTE -->
      <SearchOrganismeInput
        v-if="searchMode === 'fulltext'"
      />

      <!-- MODE 2 : IDENTIFIANT -->
      <SearchOrganismeById v-else />
    </div>
  </LayoutList>
</template>

<style scoped>
/* ============================= */
/* LIGNES CLIQUABLES (TABLE)     */
/* ============================= */

:deep(.bn-search-row) {
  cursor: pointer;
}

:deep(.bn-search-row:hover) {
  background-color: var(--background-action-low-blue-france);
}

/* ============================= */
/* UI EXISTANTE                  */
/* ============================= */

.bn-search-modes {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.bn-search-mode {
  border-radius: 9999px;
  border: 1px solid var(--border-default-grey);
  padding: 0.4rem 0.9rem;
  font-size: 0.875rem;
  background-color: white;
  cursor: pointer;
}

.bn-search-mode--active {
  background-color: var(--background-contrast-blue-france);
  border-color: var(--border-action-high-blue-france);
  color: var(--border-action-high-blue-france);
}
</style>
