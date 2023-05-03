<script lang="ts" setup>

import PermissionOptionNumber from './PermissionOptionNumber.vue'

defineProps<{
  optionName: string,
  defaultOption: any,
  optionType: { type: 'string' | 'number', multiple: boolean }
}>()
</script>

<template>
  <PermissionOptionNumber
    v-if="optionType.type === 'number'"
    :option-name="optionName"
    :default-option="defaultOption"
    :multiple="optionType.multiple"
  />
</template>
