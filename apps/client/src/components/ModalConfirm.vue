<script setup lang="ts">
const props = defineProps<{
  opened: boolean
  title: string
  confirmLabel: string
  cancelLabel: string
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'close'): void
}>()
</script>

<template>
  <DsfrModal
    :opened="props.opened"
    :title="props.title"
    :actions="[
      { label: props.confirmLabel, onClick: () => emit('confirm') },
      { label: props.cancelLabel, onClick: () => emit('close'), secondary: true },
    ]"
    @close="emit('close')"
  >
    <slot />
  </DsfrModal>
</template>
