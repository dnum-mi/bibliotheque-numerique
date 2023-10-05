<script lang="ts" setup>
import type { OrganismeTypeKeys } from '@biblio-num/shared'
import { computed, ComputedRef } from 'vue'
import OrganismeBadge from '@/components/Badges/OrganismeBadge.vue'

const props = withDefaults(defineProps<{ params: any }>(), {
  params: () => ({}),
})

const types: ComputedRef<OrganismeTypeKeys[]> = computed(() => {
  const v = props.params.value
  return ((v instanceof Array) ? v : [v]) || []
})

// const cssClass = computed(() => {})
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
