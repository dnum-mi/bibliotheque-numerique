<script lang="ts" setup>
import type { IFieldList } from '@biblio-num/shared'

import DossierSection from './DossierSection.vue'
import DossierSidemenu from './DossierSidemenu.vue'
import DossierChamps from './DossierChamps.vue'
import { useSections } from './composables/useSections'

const { annotations = [] } = defineProps<{
  annotations?: IFieldList[]
}>()

const champs = computed(() => (Array.isArray(annotations) ? annotations : []))
const { sections, expandedSections, toggleSection, smoothScroll, menuItems } = useSections(() => champs.value)
</script>

<template>
  <div class="fr-container">
    <div class="fr-grid-row fr-grid-row--center">
      <template v-if="menuItems.length">
        <DossierSidemenu
          :menu-items="menuItems"
          :smooth-scroll="smoothScroll"
        />
      </template>
      <div class="counter-start-header-section fr-col-12 fr-col-xl-9 py-4">
        <DossierSection
          :sections="sections"
          :expanded-sections="expandedSections"
          :toggle-section="toggleSection"
        >
          <template #champs="contents">
            <DossierChamps :champs="contents.champs" />
          </template>
        </DossierSection>
      </div>
    </div>
  </div>
</template>

<style scoped>
.counter-start-header-section {
  counter-reset: h2;
}
</style>
