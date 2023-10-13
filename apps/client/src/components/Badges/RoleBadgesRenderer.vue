<script lang="ts" setup>

import type { DsfrBadge } from '@gouvminint/vue-dsfr'
import type { ICellRendererParams } from 'ag-grid-community'
import { computed } from 'vue'

const props = defineProps<{ params: ICellRendererParams }>()

type DsfrBageType = Exclude<InstanceType<typeof DsfrBadge>['$props']['type'], undefined>

const dictionary: Record<string, { label: string, type: DsfrBageType }> = {
  sudo: { label: 'Administrateur technique', type: 'info' },
  superadmin: { label: 'Administrateur de tous les démarches', type: 'info' },
  admin: { label: 'Administrateur', type: 'info' },
  instructor: { label: 'Instructeur', type: 'new' },
}

const label = computed<string>(() => {
  return dictionary[props.params.value]?.label || 'Aucune permission'
})
const type = computed<string>(() => {
  return dictionary[props.params.value]?.type || 'info'
})
const classCustom = computed(() => {
  return `custom-${props.params.value || 'default'}`
})

const filterSelectAll = computed(() => {
  return props.params.value === 'Tout sélectionner'
})
</script>

<template>
  <span v-if="filterSelectAll">{{ props.params.value }}</span>
  <DsfrBadge
    v-else
    :class="classCustom"
    :label="label"
    type="info"
    small
    no-icon
  />
</template>

<style>
.custom-sudo {
  /* --text-default-info: var(--text-default-info);
  --background-contrast-info: var(--background-contrast-info); */
}
.custom-superadmin {
  /* --text-default-info: var(--text-default-info);
  --background-contrast-info: var(--background-contrast-info); */
}
.custom-admin {
  /* --text-default-info: var(--text-default-info);
  --background-contrast-info: var(--background-contrast-info); */
}
.custom-default {
  --text-default-info: var(--text-disabled-grey);
  --background-contrast-info: var(--background-disabled-grey);
}
.custom-instructor {
  --text-default-info: var(--brown-cafe-creme-sun-383-moon-885);
  --background-contrast-info: var(--brown-cafe-creme-925-125);
}
</style>
