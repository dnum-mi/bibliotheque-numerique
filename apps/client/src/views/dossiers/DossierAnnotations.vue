<script lang="ts" setup>
import type { IDossier } from '@biblio-num/shared-utils'

import DossierChamps from './DossierChamps.vue'

withDefaults(defineProps<{
    annotations?: IDossier['dsDataJson']['annotations']
  }>(), {
  annotations: () => [],
})

</script>
<template>
  <div class="fr-container">
    <DossierChamps :champs="annotations" />
  </div>
</template>
