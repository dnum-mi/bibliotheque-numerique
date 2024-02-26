<script lang="ts" setup>
import { getFileRoute } from '@/api/bn-api-routes'
import { baseApiUrl } from '@/api/api-client'

const props = defineProps<{ params: { value: { uuid: string } } }>()
// BAUDOIN ici: (pas testé)
const errorFile = computed(() => props.params.value.uuid === 'ERROR')
const href = computed(() => baseApiUrl + getFileRoute(props.params.value.uuid))
</script>

<template>
  <div>
    <template v-if="errorFile">
      <VIcon
        style="cursor: not-allowed; color: red"
        name="ri-close-fill"
      />
    </template>
    <template v-else>
      <a
        :href="href"
        download
        target="_blank"
        style="background-image: none"
        class="attachment"
        @click.stop
      >
        <VIcon name="ri-external-link-fill" />
      </a>
    </template>
  </div>
</template>

<style scoped>
.attachment:after {
  background: none;
  mask-image: none;
  -webkit-mask-image: none !important;
}
</style>
