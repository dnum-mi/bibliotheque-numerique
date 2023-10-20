<script lang="ts" setup>
import type { IDossier } from '@biblio-num/shared'
import DossierChamps from './DossierChamps.vue'

withDefaults(defineProps<{
    datas?: IDossier['dsDataJson']
  }>(), {
  datas: () => ({}),
})

</script>
<template>
  <div class="fr-container">
    <DossierChamps :champs="datas?.annotations" />
  </div>
</template>
