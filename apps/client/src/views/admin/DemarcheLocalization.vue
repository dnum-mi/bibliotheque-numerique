<script setup lang="ts">
import type { PrefectureOptions } from '@biblio-num/shared'

withDefaults(defineProps<Partial<{
  national: boolean
  prefectures: string[]
}>>(), {
  national: false,
  prefectures: () => [],
})

</script>

<template>
  <div
    v-if="national"
    class="flex  no-wrap  gap-1"
  >
    <DsfrBadge
      label="National"
      type="success"
      small
      no-icon
    />
  </div>
  <div
    v-else
    class="flex  no-wrap  gap-1"
  >
    <DsfrBadge
      v-for="pref in prefectures"
      :key="pref"
      :label="pref"
      type="success"
      small
      no-icon
    />
  </div>
</template>
