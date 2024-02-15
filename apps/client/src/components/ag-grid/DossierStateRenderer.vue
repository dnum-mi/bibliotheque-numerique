<script lang="ts" setup>
import type { DossierStateKeys } from '@biblio-num/shared-utils'

import { stateToFr } from '@/utils'

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
