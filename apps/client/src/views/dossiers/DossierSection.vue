<script setup lang="ts">
import type { Section } from './composables/useGroupedChamps'

defineProps<{
  sections: Section[]
  expandedSections: (string | undefined)[]
  toggleSection: (section: string) => void
}>()
</script>

<template>
  <div
    v-for="(section, index) in sections"
    :key="section.header?.id || index"
    class="counter-h2"
  >
    <template v-if="section.header">
      <div class="flex bn-ds-section">
        <h2
          :id="section.header.id"
          class="section-2 header-section fr-m-0 fr-text--md fr-px-4v flex-grow fr-text-action-high--blue-france fr-py-2w"
        >
          {{ section.header.label }}
        </h2>
        <DsfrButton
          no-outline
          tertiary
          :aria-expanded="expandedSections.includes(section.header.id)"
          :aria-label="expandedSections.includes(section.header.id) ? 'Réduire la section' : 'Déplier la section'"
          @click="toggleSection(section.header.id)"
        >
          <span
            :class="[expandedSections.includes(section.header.id) ? 'fr-icon-arrow-up-s-line' : 'fr-icon-arrow-down-s-line']"
            aria-hidden="true"
          />
        </DsfrButton>
      </div>
      <div
        v-show="expandedSections.includes(section.header.id)"
        :id="`section-content-${section.header.id}`"
      >
        <slot
          name="champs"
          :champs="section.contents"
        />
      </div>
    </template>
    <template v-else>
      <slot
        name="champs"
        :champs="section.contents"
      />
    </template>
  </div>
</template>

<style scoped>
.counter-h2 {
  counter-reset: h3;
}

.header-section.section-2::before {
  counter-increment: h2;
  content: counter(h2) '. ';
}

.bn-ds-section {
  border-top: 1px solid var(--border-default-grey);
}
</style>
