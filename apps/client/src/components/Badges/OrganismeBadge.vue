<script lang='ts' setup>
import type { OrganismeTypeKeys } from '@biblio-num/shared'

defineProps<{
  type: OrganismeTypeKeys
  big?: boolean
}>()
</script>

<template>
  <DsfrBadge
    :class="`custom-${type.toLowerCase()}`"
    :label="type"
    :small="!big"
    type="success"
    no-icon
  />
</template>

<style scoped>
.custom-culte {
  --text-default-success: var(--text-action-high-yellow-moutarde);
  --background-contrast-success: var(--background-contrast-yellow-moutarde);
}

.custom-fdd {
  --text-default-success: #6e445a;
  --background-contrast-success: #fee7fc;
}

.custom-fe {
  --text-default-success: #8d533e;
  --background-contrast-success: #fef4f2;
}

.custom-arup,
.custom-frup {
  --text-default-success: #66673d;
  --background-contrast-success: var(--green-tilleul-verveine-975-75);
}
</style>
