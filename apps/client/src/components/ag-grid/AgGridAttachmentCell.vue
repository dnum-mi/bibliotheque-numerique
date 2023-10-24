<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{ params: { value: { url: string } } }>()
const href = computed(() => props.params.value.url)

</script>

<template>
  <div>
    <a
      :href="href"
      download
      target="_blank"
      style="background-image: none;"
      class="attachment"
      @click.stop
    >
      <VIcon name="ri-external-link-fill" />
    </a>
  </div>
</template>

<style scoped>
.attachment:after {
  background: none;
  mask-image: none;
  -webkit-mask-image: none !important;
}
</style>
