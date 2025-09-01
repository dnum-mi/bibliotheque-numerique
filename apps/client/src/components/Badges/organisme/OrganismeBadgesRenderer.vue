<script lang="ts" setup>
import type { OrganismeTypeKey } from '@biblio-num/shared/dist/src/index'

import OrganismeBadge from '@/components/Badges/organisme/OrganismeBadge.vue'

const props = defineProps<{ params: { value: OrganismeTypeKey | OrganismeTypeKey[] } }>()

const types = computed(() => {
  const value = props.params.value
  return Array.isArray(value) ? value : [value]
})
</script>

<template>
  <div class="flex  w-full  h-full  items-center  gap-2">
    <OrganismeBadge
      v-for="type in types"
      :key="type"
      :type="type"
    />
  </div>
</template>
