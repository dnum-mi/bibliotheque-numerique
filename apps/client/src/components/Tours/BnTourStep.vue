<script setup lang="ts">
export interface BnTourButton {
  text: string
  action: string
  secondary?: boolean
  tertiary?: boolean
}

defineProps<{
  text?: string
  buttons: BnTourButton[]
}>()

const emit = defineEmits<{
  (e: 'action', actionName: string): void
}>()
</script>

<template>
  <div class="bn-tour-step-content">
    <div
      v-if="text"
      v-html="text"
    />

    <div
      v-if="buttons.length"
      class="flex flex-row gap-2 fr-btns-group--right w-full fr-mt-3w"
    >
      <DsfrButton
        v-for="button in buttons"
        :key="button.action"
        :label="button.text"
        :secondary="button.secondary"
        :tertiary="button.tertiary"
        size="small"
        @click="emit('action', button.action)"
      />
    </div>
  </div>
</template>
