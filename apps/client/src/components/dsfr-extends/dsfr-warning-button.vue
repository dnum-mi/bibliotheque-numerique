<script setup lang="ts">
import type { DsfrButtonProps } from '@gouvminint/vue-dsfr/types/components/DsfrButton/DsfrButton.vue'
const props = defineProps<DsfrButtonProps>()

</script>

<template>
  <DsfrButton
    class="warning-button"
    :label="label"
    secondary
    :disabled="disabled"
    :icon-right="iconRight"
    :icon-only="iconOnly"
    :no-outline="noOutline"
    :size="size"
    :icon="icon"
    @click="onClick"
  />
</template>

<style scoped>

.warning-button:enabled {
  color: var(--red-marianne-425-625);
  border: 1px solid var(--red-marianne-425-625) !important;
  box-shadow: none !important;
}
</style>
