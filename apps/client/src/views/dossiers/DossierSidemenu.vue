<script setup lang="ts">
import type { MenuItem } from './composables/useGroupedChamps'

defineProps<{
  menuItems: MenuItem[]
  smoothScroll: (id: string) => void
}>()
</script>

<template>
  <div
    id="summary"
    class="fr-col-12 fr-col-xl-3"
  >
    <ul class="fr-sidemenu sticky-sidemenu fr-hidden fr-unhidden-xl">
      <li
        v-for="(item, index) in menuItems"
        :key="index"
        class="fr-sidemenu__item"
      >
        <a
          :href="item.to"
          class="fr-sidemenu__link"
          :aria-controls="`section-content-${item.id}`"
          @click.prevent="smoothScroll(item.id)"
        >
          {{ item.text }}
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.sticky-sidemenu {
  position: sticky;
  top: 2em;
}

[href] {
  background-image: none !important;
  background-position: initial !important;
  background-repeat: initial !important;
  background-size: initial !important;
}
</style>
