<script setup lang="ts">
const props = defineProps<{
  params: {
    value: boolean
  }
}>()

const isFounder = computed(() => !!props.params?.value)
</script>

<template>
  <DsfrBadge
    v-if="isFounder"
    label="Oui"
    type="new"
    no-icon
    class="fr-badge--sm"
  />
  <span v-else class="fr-text--sm">
    Non
  </span>
</template>
