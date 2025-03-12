<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  opened: Boolean,
  title: String,
  confirmLabel: String,
  cancelLabel: String,
})

const emit = defineEmits(['confirm', 'close'])
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
