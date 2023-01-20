<script lang="ts" setup>
import DossierChamps from './DossierChamps.vue'

withDefaults(defineProps<{
    datas?: object
  }>(), {
  datas: () => ({}),
})

</script>
<template>
  <div class="fr-container">
    <DossierChamps :datas="datas?.annotations" />
  </div>
</template>
