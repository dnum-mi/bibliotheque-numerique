<script setup lang="ts">
defineProps<{
  label: string
  value: string | number | boolean | null | undefined
  hasChanged: boolean
}>()
</script>

<template>
  <div
    class="field-container"
    :class="{ 'field--changed': hasChanged }"
  >
    <label class="bn-fiche-sub-title--label uppercase">{{ label }}</label>
    <span
      v-if="value"
      class="fr-text--bold fr-text--sm mb-1!"
    >
      {{ value }}
    </span>
    <span
      v-else
      class="fr-text--medium italic fr-text--sm mb-1!"
    >
      Non renseigné
    </span>
  </div>
</template>

<style scoped>
.field-container {
  padding: 0.75rem;
  border-radius: 6px;
  transition: background-color 0.2s ease-in-out;
  border-left: 4px solid transparent;
}

.field--changed {
  border-left-color: var(--yellow-tournesol-925-125-active);
  background-color: var(--yellow-tournesol-975-75);
}
</style>
