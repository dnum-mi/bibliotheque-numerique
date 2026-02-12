<script setup lang="ts">
import { eEstablishmentStatus } from '@/shared/types/Establishment.type'
import type { EstablishmentStatusKey } from '@/shared/types/Establishment.type'
import type { DsfrBadgeProps } from '@gouvminint/vue-dsfr'

type BadgeType = Exclude<DsfrBadgeProps['type'], undefined>

defineProps<{
  params: { value: EstablishmentStatusKey }
}>()

const statusConfig: Record<EstablishmentStatusKey, { label: string, type: BadgeType }> = {
  [eEstablishmentStatus.ACQUIS]: { label: eEstablishmentStatus.ACQUIS, type: 'success' as const },
  [eEstablishmentStatus.SECONDAIRE]: { label: eEstablishmentStatus.SECONDAIRE, type: 'info' as const },
  [eEstablishmentStatus.CÉDÉ]: { label: eEstablishmentStatus.CÉDÉ, type: 'error' as const },
}
</script>

<template>
  <DsfrBadge
    v-if="params.value"
    :label="statusConfig[params.value].label"
    :type="statusConfig[params.value].type"
    no-icon
    small
  />
</template>
