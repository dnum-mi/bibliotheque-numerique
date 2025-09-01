<script setup lang="ts">
withDefaults(defineProps<Partial<{
  national: boolean
  prefectures: string[]
}>>(), {
  national: false,
  prefectures: () => [],
})
</script>

<template>
  <!--  NATIONAL -->
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
  <!--  Prefectures -->
  <div
    v-else
    class="flex  gap-1  overflow-auto"
  >
    <DsfrBadge
      v-for="pref in prefectures"
      :key="pref"
      :label="pref.substring(1)"
      type="success"
      small
      no-icon
    />
  </div>
</template>
