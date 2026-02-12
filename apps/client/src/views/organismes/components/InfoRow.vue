<script setup lang="ts">
defineProps<{
  label: string;
  isGrey?: boolean;
}>()
</script>

<template>
  <div class="fr-grid-row fr-grid-row--middle fr-py-2w info-row">
    <div class="fr-col-12 fr-col-md-3 fr-pr-2v">
      <span class="fr-text--bold fr-text--sm">{{ label }}</span>
    </div>
    <div class="fr-col-12 fr-col-md-9">
      <div class="fr-text--sm fr-m-0">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-row {
  border-bottom: 1px solid var(--border-default-grey);
}

.info-row:last-child {
  border-bottom: none;
}
</style>
