<script setup lang="ts">
import type { siafV2 } from '@biblio-num/shared'
import { VIcon } from '@gouvminint/vue-dsfr'

// Typage des props attendues
interface RelationProps {
  founderLegalEntities: siafV2.ILegalEntity[]
  foundedLegalEntities: siafV2.ILegalEntity[]
  governanceLegalEntities: siafV2.ILegalEntity[]
  fromLineage: siafV2.ILineage | null
  toLineage: siafV2.ILineage | null
  currentOrganismeTitle: string // Le nom de l'organisme actuel (ex: "Fondation pour l'Enfance")
}

const props = defineProps<RelationProps>()

const activeAccordion = ref<number>(-1) //

const lineageCount = computed(() => {
  let count = 0
  if (props.fromLineage) count += props.fromLineage.organismes.length
  if (props.toLineage) count += props.toLineage.organismes.length
  return count
})
const structuralRelationsCount = computed(() => {
  return (props.founderLegalEntities?.length || 0) + (props.governanceLegalEntities?.length || 0)
})
const foundedCount = computed(() => props.foundedLegalEntities?.length || 0)

// Calcule si l'onglet est vide pour afficher un message
const hasRelations = computed(() => {
  return lineageCount.value > 0 || structuralRelationsCount.value > 0 || foundedCount.value > 0
})

// Formatteur de date simple
const dateToStringFr = (date: Date): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Fonction utilitaire pour l'affichage de la filiation
const lineageToString = (lineage: siafV2.ILineage): string => {
  const date = dateToStringFr(lineage.at)
  switch (lineage.type) {
    case 'Fusion':
      return `Issue d'une fusion le ${date}`
    case 'Scission':
      return `Issue d'une scission le ${date}`
    case 'Transformation':
      return `Issue d'une transformation le ${date}`
    default:
      return `Événement de filiation le ${date}`
  }
}

// Fonction pour simuler un clic (à remplacer par votre router-link)
const goToFiche = (publicId: string) => {
  alert(`Navigation vers la fiche : ${publicId}`)
}
</script>

<template>
  <div class="fr-py-6v fr-px-4v">
    <div v-if="!hasRelations">
      <p>Aucune relation de filiation ou de gouvernance n'est enregistrée pour cet organisme.</p>
    </div>

    <DsfrAccordionsGroup
      v-else
      v-model="activeAccordion"
    >
      <DsfrAccordion
        id="lineage"
        :title="`Historique de la structure (${lineageCount})`"
      >
        <p
          v-if="lineageCount === 0"
          class="fr-text--sm fr-mb-0"
        >
          Aucun historique de filiation (fusion, scission...) enregistré.
        </p>

        <div
          v-if="fromLineage"
          class="lineage-flow"
        >
          <h3
            class="w-full flex justify-center align-center text-base/7 font-semibold text-gray-900 mb-0 fr-background-alt--grey fr-py-3v fr-px-2w"
          >
            Issu des organismes suivants :
          </h3>
          <div class="mt-6 flex gap-2">
            <div
              v-for="org in fromLineage.organismes"
              :key="org.publicId"
              class="flex flex-row gap-2"
            >
              <DsfrCard
                :title="org.publicId"
                :detail="org.kind"
                description="Organisme source"
                is-clickable
                @click="goToFiche(org.publicId)"
              />
            </div>
          </div>

          <div class="flow-arrow">
            <VIcon
              name="ri-arrow-down-line"
              scale="2"
              class="mr-1"
            />
            <span class="fr-tag fr-tag--sm">{{ lineageToString(fromLineage) }}</span>
          </div>

          <DsfrCard
            :title="currentOrganismeTitle"
            description="Structure actuelle"
            class="current-org-card"
          />
        </div>

        <div
          v-if="toLineage"
          class="lineage-flow fr-mt-4v"
        >
          <div class="px-4 sm:px-0">
            <h3 class="text-base/7 font-semibold text-gray-900 mb-0 fr-background-alt--grey fr-py-3v fr-px-2w">
              A donné lieu aux organismes suivants
            </h3>
          </div>
          <DsfrCard
            :title="currentOrganismeTitle"
            description="Structure dissoute"
            class="current-org-card"
          />

          <div class="flow-arrow">
            <VIcon
              name="ri-arrow-down-line"
              scale="2"
              class="mr-1"
            />
            <span class="fr-tag fr-tag--sm">{{ lineageToString(toLineage) }}</span>
          </div>

          <div class="fr-grid-row fr-grid-row--gutters">
            <div
              v-for="org in toLineage.organismes"
              :key="org.publicId"
              class="fr-col-12 fr-col-md-4"
            >
              <DsfrCard
                :title="org.publicId"
                :detail="org.kind"
                description="Nouvelle structure"
                is-clickable
                @click="goToFiche(org.publicId)"
              />
            </div>
          </div>
        </div>
      </DsfrAccordion>
      <DsfrAccordion
        id="structural"
        :title="`Relations structurelles (${structuralRelationsCount})`"
      >
        <div class="px-4 sm:px-0">
          <h3 class="text-base/7 font-semibold text-gray-900 mb-0 fr-background-alt--grey fr-py-3v fr-px-2w">
            Fondateurs (Personnes Morales)
          </h3>
        </div>
        <div
          class="mt-6"
          v-if="!founderLegalEntities || !founderLegalEntities.length"
        >
          <p class="fr-text--sm">Aucun fondateur (personne morale) enregistré.</p>
        </div>
        <div
          v-else
          class="mt-6 flex flex-row gap-3"
        >
          <div
            v-for="entity in founderLegalEntities"
            :key="entity.publicId"
          >
            <DsfrCard
              :title="entity.publicId"
              :detail="entity.type"
              description="Entité fondatrice"
              is-clickable
              @click="goToFiche(entity.publicId)"
            />
          </div>
        </div>

        <div class="mt-6 px-4 sm:px-0">
          <h3 class="text-base/7 font-semibold text-gray-900 mb-0 fr-background-alt--grey fr-py-3v fr-px-2w">
            Participation à la gouvernance
          </h3>
        </div>
        <div
          class="mt-6"
          v-if="!governanceLegalEntities || !governanceLegalEntities.length"
        >
          <p class="fr-text--sm">Aucune personne morale ne participe à la gouvernance.</p>
        </div>
        <div
          v-else
          class="mt-6 flex flex-row gap-3"
        >
          <div
            v-for="entity in governanceLegalEntities"
            :key="entity.publicId"
          >
            <DsfrCard
              :title="entity.publicId"
              :detail="entity.type"
              description="Participe à la gouvernance"
              is-clickable
              @click="goToFiche(entity.publicId)"
            />
          </div>
        </div>
      </DsfrAccordion>
      <DsfrAccordion
        id="founded"
        :title="`Entités créées par cet organisme (${foundedCount})`"
      >
        <div v-if="!foundedLegalEntities || !foundedLegalEntities.length">
          <p class="fr-text--sm fr-mb-0">Cet organisme n'a créé aucune autre entité légale.</p>
        </div>
        <div
          v-else
          class="flex gap-3"
        >
          <div
            v-for="entity in foundedLegalEntities"
            :key="entity.publicId"
          >
            <DsfrCard
              :title="entity.publicId"
              :detail="entity.type"
              description="Entité créée"
              is-clickable
              @click="goToFiche(entity.publicId)"
            />
          </div>
        </div>
      </DsfrAccordion>
    </DsfrAccordionsGroup>
  </div>
</template>

<style scoped>
.lineage-flow {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.flow-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0;
  color: var(--text-disabled-grey);
}

.flow-arrow .fr-tag {
  margin-top: 0.5rem;
  background-color: var(--background-alt-blue-france);
  color: var(--text-title-blue-france);
}

.current-org-card {
  border: 2px solid var(--border-action-high-blue-france);
  max-width: 400px; /* Limite la largeur pour le visuel */
  width: 100%;
}
</style>
