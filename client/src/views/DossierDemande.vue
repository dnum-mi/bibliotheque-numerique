<script lang="ts" setup>
import { isPersonneMorale, isPersonnePhysique } from '@/utils/helperDemandeur'
import { computed } from 'vue'
import DossierDemandeurMoral from './DossierDemandeurMoral.vue'
import DossierDemandeurPhysique from './DossierDemandeurPhysique.vue'
const props = withDefaults(defineProps<{
    datas?: object
  }>(), {
  datas: () => ({}),
})

const isDemandeurMorale = computed(() => isPersonneMorale(props.datas?.demandeur?.__typename))
const isDemandeurPhysique = computed(() => isPersonnePhysique(props.datas?.demandeur?.__typename))
const demandeur = computed(() => props.datas?.demandeur || {})
console.log({ datas: props.datas.value, isDemandeurMorale: isDemandeurMorale.value, isDemandeurPhysique: isDemandeurPhysique.value, demandeur: demandeur.value })
</script>

<template>
  <h3>
    Identité du demandeur:
  </h3>
  <DossierDemandeurMoral
    v-if="isDemandeurMorale"
    :datas="demandeur"
  />
  <DossierDemandeurPhysique
    v-if="isDemandeurPhysique"
    :datas="demandeur"
  />
  <h3>
    Formulaire
  </h3>
  <div>
    {{ champsD }}
  </div>
</template>
