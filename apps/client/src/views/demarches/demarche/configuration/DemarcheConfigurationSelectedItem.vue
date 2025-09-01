<script lang="ts" setup>
import type { IMappingColumn } from '@biblio-num/shared'

defineProps<{ champ: IMappingColumn, canChangeLabel: boolean }>()

const emit = defineEmits<{
  'remove': []
  'update:modelValue': [label: string]
}>()
</script>

<template>
  <div class="flex  gap-4">
    <div>
      <DsfrButton
        :id="`display-${champ.id}`"
        :name="champ.id"
        icon="ri-close-line"
        size="sm"
        :label="champ.columnLabel"
        icon-only
        style="padding: 0.175rem  0.375rem"
        @click="emit('remove')"
      />
    </div>
    <p
      :id="`labelSource-${champ.id}`"
      class="fr-m-0  ellipsis  w-[320px]  line-height-[2rem]"
      :title="champ.originalLabel"
    >
      {{ champ.originalLabel }}
    </p>
    <div v-if="canChangeLabel" class="fr-col-5  fr-px-2v">
      <DsfrInput
        :id="`labelBN-${champ.id}`"
        :model-value="champ.columnLabel"
        class="fr-m-0"
        label-visible
        @update:model-value="emit('update:modelValue', $event)"
      />
    </div>
  </div>
</template>
