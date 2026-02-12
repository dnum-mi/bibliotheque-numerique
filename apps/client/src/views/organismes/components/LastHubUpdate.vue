<script setup lang="ts">
import { dateToFormatLongDateStringFr } from '@/utils/date-to-string'

const props = defineProps<{
  timestamp?: Date | string
}>()

const lastUpdateDate = computed(() => {
  return props.timestamp ? `le ${dateToFormatLongDateStringFr(props.timestamp)}` : 'non déterminée'
})
</script>

<template>
  <div class="fr-text--xs font-normal">
    <VIcon name="ri-pencil-line" class="fr-text--sm fr-mb-0" />
    Dernière mise à jour {{ lastUpdateDate }}.
  </div>
</template>
