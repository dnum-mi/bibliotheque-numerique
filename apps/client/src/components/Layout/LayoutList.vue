<script lang="ts" setup>
import LayoutBanner from '@/components/Layout/LayoutBanner.vue'
withDefaults(defineProps<{
  titleBgColor: string
  titleIcon: string
  title: string
}>(), {
  titleBgColor: 'var(--background-action-high-beige-gris-galet-active)',
  titleIcon: 'fr-icon-search-line',
  title: 'Pas de titre',
})
</script>
<template>
  <div class="flex flex-col">
    <LayoutBanner
      :title="title"
      :title-bg-color="titleBgColor"
      :title-icon="titleIcon"
    />
    <div class="flex-grow">
      <slot name="default" />
    </div>
  </div>
</template>

<style scoped>
</style>
