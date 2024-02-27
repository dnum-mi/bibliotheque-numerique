<script lang="ts" setup>
import type { RolesKeys } from '@biblio-num/shared/dist/src/index'

withDefaults(defineProps<{ role?: RolesKeys, small?: boolean }>(), {
  role: 'norole',
  small: true,
})

const dictionary: Record<RolesKeys | 'norole', string> = {
  sudo: 'Administrateur technique',
  superadmin: 'super administrateur',
  admin: 'administrateur',
  instructor: 'instructeur',
  norole: 'aucun role',
}

const toto = { label: null, options: { 5: { national: true, prefectures: [] }, 37: { national: false, prefectures: ['D57', 'D75'] } } }
</script>

<template>
  <DsfrBadge
    :class="`custom-` + (role || 'norole')?.toLowerCase()"
    :label="dictionary[role || 'norole']"
    type="info"
    :small="small"
    no-icon
  />
</template>

<style>

.custom-sudo {
  --text-default-info: white;
  --background-contrast-info: #C94444B5;
}
.custom-superadmin {
  --text-default-info: white;
  --background-contrast-info: #C94444B5;
}

.custom-admin {}

.custom-norole {
  --text-default-info: var(--text-disabled-grey);
  --background-contrast-info: var(--background-disabled-grey);
}
.custom-instructor {
  --text-default-info: var(--brown-cafe-creme-sun-383-moon-885);
  --background-contrast-info: var(--brown-cafe-creme-925-125);
}
</style>
