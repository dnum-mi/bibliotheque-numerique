<script setup lang="ts">
import type { Section } from './composables/useGroupedChamps'

defineProps<{
  sections: Section[]
  expandedSections: (string | undefined)[]
  toggleSection: (section: string) => void
}>()
</script>

<template>
  <section
    v-for="(section, index) in sections"
    :key="section.header?.id || index"
    class="counter-h2 w-full"
  >
    <template v-if="section.header">
      <div class="bn-ds-section">
        <h2
          :id="section.header.id"
          class="flex w-full fr-m-0"
        >
          <button
            type="button"
            :aria-expanded="expandedSections.includes(section.header.id)"
            :aria-label="expandedSections.includes(section.header.id) ? 'Réduire la section' : 'Déplier la section'"
            class="fr-btn fr-btn--tertiary-no-outline fr-btn--md inline-flex flex-grow w-full fr-py-2w fr-m-0 fr-text--md fr-px-4v"
            @click="toggleSection(section.header.id)"
          >
            <span class="section-title">{{ section.header.label }}</span>
            <span
              :class="[expandedSections.includes(section.header.id) ? 'fr-icon-arrow-up-s-line' : 'fr-icon-arrow-down-s-line']"
              aria-hidden="true"
            />
          </button>
        </h2>
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
  </section>
</template>

<style scoped>
.counter-h2 {
  counter-reset: h3;
}

.section-title {
  text-align: start;
  flex-grow: 1;
  color: var(--text-action-high-blue-france);
  font-weight: 600;
}

.section-title::before {
  counter-increment: h2;
  content: counter(h2) '. ';
}

.bn-ds-section {
  border-top: 1px solid var(--border-default-grey);
  position: relative;
}
</style>
