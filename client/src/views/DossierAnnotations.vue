<script lang="ts" setup>
import DossierChamps from './DossierChamps.vue'

withDefaults(defineProps<{
    datas?: object
  }>(), {
  datas: () => ({}),
})

</script>
<template>
  <DossierChamps :datas="datas?.annotations" />
</template>
