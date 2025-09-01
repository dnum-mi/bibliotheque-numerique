<script lang="ts" setup>
import type { IOrganismeOutputDto } from '@biblio-num/shared'
import FicheOrganismeInfo from './FicheOrganismeInfo.vue'

defineProps<{ organismeRaf: IOrganismeOutputDto }>()
</script>

<template>
  <FicheOrganismeInfo :organisme="organismeRaf" type="Rnf" />
</template>
