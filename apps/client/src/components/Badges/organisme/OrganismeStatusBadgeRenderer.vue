<script lang="ts" setup>
import type { OrganismeStatusKey } from '@biblio-num/shared'

import OrganismeStatusBadge from '@/components/Badges/organisme/OrganismeStatusBadge.vue'

defineProps<{ params: { value: OrganismeStatusKey | string } }>()
</script>

<template>
  <div class="flex  w-full  h-full  items-center  gap-2">
    <OrganismeStatusBadge
      :status="params.value"
    />
  </div>
</template>
