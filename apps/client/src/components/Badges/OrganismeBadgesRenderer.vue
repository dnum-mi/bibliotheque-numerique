<script lang="ts" setup>
import { computed } from 'vue'

import type { OrganismeTypeKeys } from '@biblio-num/shared'

import OrganismeBadge from '@/components/Badges/OrganismeBadge.vue'

const props = defineProps<{ params: { value: OrganismeTypeKeys | OrganismeTypeKeys[] } }>()

const types = computed(() => {
  const value = props.params.value
  return value instanceof Array ? value : [value]
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
