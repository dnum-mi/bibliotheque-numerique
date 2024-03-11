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
  <div class="flex flex-col flex-grow  min-h-[320px]">
    <LayoutBanner
      :title="title"
      :title-bg-color="titleBgColor"
      :title-icon="titleIcon"
      class="flex-shrink-0"
    />
    <div class="flex-grow  fr-pb-4w">
      <slot name="default" />
    </div>
  </div>
</template>

<style scoped>
</style>
