<script lang="ts" setup>
import { computed } from 'vue'

const props = withDefaults(defineProps<{params: any}>(), {
  params: () => ({}),
})

const href = computed(() => props.params.value.url)
</script>

<template>
  <div class="fr-download">
    <a
      :href="href"
      download
      class="fr-download__link"
      style="background-image: none;"
    >  <span
      class="fr-icon-external-link-line"
      aria-hidden="true"
    /></a>
  </div>
</template>
