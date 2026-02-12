<script setup lang="ts">
import { eOrganismeStatus } from '@biblio-num/shared'
import type { OrganismeStatusKey } from '@biblio-num/shared'
import type { DsfrBadgeProps } from '@gouvminint/vue-dsfr'

type BadgeType = Exclude<DsfrBadgeProps['type'], undefined>

const props = defineProps<{
  status: OrganismeStatusKey | string
  big?: boolean
}>()

const badgeConfig = computed(() => {
  const statusMap: Record<OrganismeStatusKey, { type: BadgeType; label: string }> = {
    [eOrganismeStatus.Active]: { type: 'success', label: 'Active' },
    [eOrganismeStatus.Suspendue]: { type: 'warning', label: 'Suspendue' },
    [eOrganismeStatus.Transformée]: { type: 'info', label: 'Transformée' },
    [eOrganismeStatus.Fusionnée]: { type: 'new', label: 'Fusionnée' },
    [eOrganismeStatus.Scindée]: { type: 'new', label: 'Scindée' },
    [eOrganismeStatus.Dissoute]: { type: 'error', label: 'Dissoute' },
  }

  const config = statusMap[props.status as OrganismeStatusKey]

  return config || { type: 'none', label: props.status }
})
</script>

<template>
  <DsfrBadge
    :type="badgeConfig.type"
    :label="badgeConfig.label"
    :small="!big"
  />
</template>
