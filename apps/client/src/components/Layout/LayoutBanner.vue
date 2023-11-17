<script lang="ts" setup>
withDefaults(
  defineProps<{
    titleBgColor: string;
    titleIcon: string;
    title: string;
  }>(),
  {
    titleBgColor: 'var(--background-action-high-beige-gris-galet-active)',
    titleIcon: 'fr-icon-search-line',
    title: 'Pas de titre',
  },
)
</script>

<template>
  <div
    class="flex  items-center  banner-height  fr-pl-3w"
    :style="{ backgroundColor: titleBgColor }"
  >
    <span
      :class="titleIcon"
      class="text-color"
      aria-hidden="true"
    />
    <h6 class="m-0  fr-ml-1w  text-color">
      {{ title }}
    </h6>
  </div>
</template>

<style scoped>
.banner-height {
  height: 80px;
}
.text-color {
  color: var(--text-inverted-grey) !important;
}
</style>
