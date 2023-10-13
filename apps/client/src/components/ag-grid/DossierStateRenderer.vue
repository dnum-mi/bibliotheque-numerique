<script lang="ts" setup>
import { computed } from 'vue'

import { stateToFr } from '@/utils'
import type { DossierStateKeys } from '@biblio-num/shared'

const props = defineProps<{
  params: {
    value: DossierStateKeys,
  }
}>()

const state = computed(() => {
  return stateToFr(props?.params?.value)
})
</script>

<template>
  <div>
    <DsfrBadge
      no-icon
      small
      :label="state.label"
      :type="state.type"
    />
  </div>
</template>/utils/state-to-string
