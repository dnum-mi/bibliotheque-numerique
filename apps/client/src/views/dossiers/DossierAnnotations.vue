<script lang="ts" setup>
import type { IDossier } from '@biblio-num/shared'

import { useGroupedChamps } from './composables/useGroupedChamps'
import type { ChampWithDescriptor } from './composables/useGroupedChamps'
import DossierSection from './DossierSection.vue'
import DossierSidemenu from './DossierSidemenu.vue'

const { annotations } = withDefaults(
  defineProps<{
    annotations?: IDossier['dsDataJson']['annotations']
  }>(),
  {
    annotations: () => [],
  },
)

const champs = computed(() => (Array.isArray(annotations) ? (annotations as ChampWithDescriptor[]) : []))
const { groupedChamps, expandedSections, toggleSection, smoothScroll, menuItems } = useGroupedChamps(() => champs.value)
</script>

<template>
  <div class="fr-container">
    <div class="fr-grid-row fr-grid-row--center tab-content">
      <template v-if="menuItems.length">
        <DossierSidemenu
          :menu-items="menuItems"
          :smooth-scroll="smoothScroll"
        />
      </template>
      <div class="counter-start-header-section fr-col-12 fr-col-xl-9">
        <DossierSection
          :sections="groupedChamps"
          :expanded-sections="expandedSections"
          :toggle-section="toggleSection"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.counter-start-header-section {
  counter-reset: h2;
}
</style>
