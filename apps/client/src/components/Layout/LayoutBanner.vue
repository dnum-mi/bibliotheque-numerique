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
    class="flex items-center banner-height fr-pl-3w"
    :style="{ backgroundColor: titleBgColor }"
  >
    <span
      :class="titleIcon"
      class="text-color icon-size"
      aria-hidden="true"
    />
    <h6 class="m-0 fr-ml-1w text-color title-size">
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
.icon-size {
  font-size: 24px;
}
.title-size {
  font-size: 20px;
}

 @media screen and (max-height: 780px) {
  .banner-height {
    height: 40px;
  }
  .icon-size {
    font-size: 1em;
  }
  .title-size {
    font-size: 1em;
  }
 }
</style>
