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

<script lang="ts" setup>
import { computed } from 'vue'

const props = withDefaults(defineProps<{params: any}>(), {
  params: () => ({}),
})

const cellValues = computed(() => {
  return props.params.value || []
})

const format = computed(() => props.params.value.contentType)
const size = computed(() => props.params.value.byteSizeBigInt)
const href = computed(() => props.params.value.url)

</script>
