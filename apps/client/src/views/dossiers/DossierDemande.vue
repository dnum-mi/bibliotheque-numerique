<script lang="ts" setup>
import { isPersonneMorale, isPersonnePhysique } from '@/utils/helperDemandeur'
import { dateTimeToFormatedStringFr } from '@/utils/date-to-string'
import DossierDemandeurMoral from './DossierDemandeurMoral.vue'
import DossierDemandeurPhysique from './DossierDemandeurPhysique.vue'
import type { Demandeur, Dossier } from '@dnum-mi/ds-api-client'
import { useGroupedChamps } from './composables/useGroupedChamps'
import type { ChampWithDescriptor } from './composables/useGroupedChamps'
import DossierSection from './DossierSection.vue'
import DossierSidemenu from './DossierSidemenu.vue'
import DossierChamps from './DossierChamps.vue'

type PopulatedDossier = (Dossier & { demandeur: Demandeur & { __typename: string } }) | Record<string, never>

const props = withDefaults(
  defineProps<{
    datas?: PopulatedDossier
  }>(),
  {
    datas: () => ({}),
  },
)

const isDemandeurMorale = computed(() => isPersonneMorale(props.datas?.demandeur?.__typename))
const isDemandeurPhysique = computed(() => isPersonnePhysique(props.datas?.demandeur?.__typename))
const depositDate = computed(() => props.datas?.dateDepot)
const demandeur = computed(() => props.datas?.demandeur)
const champs = computed(() => (Array.isArray(props.datas?.champs) ? (props.datas.champs as ChampWithDescriptor[]) : []))

const { groupedChamps, expandedSections, toggleSection, smoothScroll, menuItems } = useGroupedChamps(() => champs.value)
</script>

<template>
  <div class="fr-container">
    <div class="fr-grid-row fr-grid-row--center">
      <template v-if="menuItems.length">
        <DossierSidemenu
          :menu-items="menuItems"
          :smooth-scroll="smoothScroll"
        />
      </template>
      <div class="fr-col-12 fr-col-xl-9 py-4">
        <div class="fr-mb-4w">
          <h2 class="fr-h6 fr-background-alt--grey fr-mb-4w fr-py-3v fr-px-2w">Date de dépôt du dossier</h2>
          <div class="fr-px-4v">
            <p>Déposé le {{ dateTimeToFormatedStringFr(depositDate || '') }}</p>
          </div>
        </div>

        <div class="fr-mb-4w">
          <h2 class="fr-h6 fr-background-alt--grey fr-mb-4w fr-py-3v fr-px-2w">Identité du déclarant</h2>
          <DossierDemandeurMoral
            v-if="isDemandeurMorale"
            :datas="demandeur"
          />
          <DossierDemandeurPhysique
            v-if="isDemandeurPhysique"
            :datas="demandeur"
          />
        </div>

        <div class="counter-start-header-section fr-mb-4w">
          <h2 class="fr-h6 fr-background-alt--grey fr-mb-4w fr-py-3v fr-px-2w">Sections du fomulaire</h2>
          <DossierSection
            :sections="groupedChamps"
            :expanded-sections="expandedSections"
            :toggle-section="toggleSection"
          >
            <template #champs="contents">
              <DossierChamps :champs="contents.champs" />
            </template>
          </DossierSection>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.counter-start-header-section {
  counter-reset: h2;
}
</style>
