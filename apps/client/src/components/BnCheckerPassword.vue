<script setup lang="ts">
import { defineProps, computed } from 'vue'

const props = withDefaults(defineProps<{
  valid: boolean,
  text?: string,
 }>(), {
  text: '',
})

const iconClass = computed(() => ({
  'fr-icon-error-fill  fr-text-default--error': !props.valid,
  'fr-icon-success-fill  fr-text-default--success': props.valid,
}))

</script>
<template>
  <span class="ml-2">
    <span
      :class="iconClass"
      aria-hidden="true"
    />
    {{ text }}
    <slot />
  </span>
</template>
