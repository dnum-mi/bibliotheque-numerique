<script lang="ts" setup>
import { computed } from 'vue'
import type { Demandeur, TDossier, Champ } from '@biblio-num/shared'

import { isPersonneMorale, isPersonnePhysique } from '@/utils/helperDemandeur'
import DossierChamps from './DossierChamps.vue'
import DossierDemandeurMoral from './DossierDemandeurMoral.vue'
import DossierDemandeurPhysique from './DossierDemandeurPhysique.vue'

type PopulatedDossier = TDossier & { demandeur: Demandeur & { __typename: string } } | Record<string, never>

const props = withDefaults(defineProps<{
    datas?: PopulatedDossier
  }>(), {
  datas: () => ({}),
})

const isDemandeurMorale = computed(() => isPersonneMorale((props.datas?.demandeur)?.__typename))
const isDemandeurPhysique = computed(() => isPersonnePhysique((props.datas?.demandeur)?.__typename))
const demandeur = computed(() => props.datas?.demandeur)
const champs = computed<Champ[]>(() => props.datas?.champs as Champ[])
</script>

<template>
  <div class="fr-container">
    <div class="fr-grid-row fr-mb-5v">
      <h5 class="">
        <span
          class="fr-icon-account-line fr-icon--lg fr-mr-2w bn-ellipse bn-ellipse-account"
          aria-hidden="true"
        />Identité du déclarant
      </h5>
      <DossierDemandeurMoral
        v-if="isDemandeurMorale"
        :datas="demandeur"
      />
      <DossierDemandeurPhysique
        v-if="isDemandeurPhysique"
        :datas="demandeur"
      />
    </div>
    <hr class="fr-mt-4w">
    <div class="fr-grid-row fr-mb-5v">
      <h5>
        <span
          class="fr-icon-file-text-line fr-icon--lg fr-mr-2w bn-ellipse bn-ellipse-file-text"
          aria-hidden="true"
        />Formulaire
      </h5>
      <DossierChamps :champs="champs " />
    </div>
  </div>
</template>
