<script lang="ts" setup>
defineProps<{ show: boolean }>()
</script>

<template>
  <div class="inline">
    <DsfrTooltip
      v-if="show"
      content="Adresse non confirmée par notre système"
      on-hover
    >
      <span class="fr-icon-warning-line color-orange" />
    </DsfrTooltip>
  </div>
</template>

<style scoped>
  :deep(.fr-link) {
    background-image: none;
  }
</style>
