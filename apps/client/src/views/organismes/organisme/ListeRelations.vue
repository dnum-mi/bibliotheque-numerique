<script setup lang="ts">
import { routeNames } from '@/router/route-names'
import { dateToStringFr } from '@/utils'
import type { ILegalEntity, ILineage } from '@biblio-num/shared'
import { VIcon } from '@gouvminint/vue-dsfr'

interface RelationProps {
  founderLegalEntities: ILegalEntity[]
  foundedLegalEntities: ILegalEntity[]
  governanceLegalEntities: ILegalEntity[]
  fromLineage: ILineage | null
  toLineage: ILineage | null
  currentOrganismeTitle: string
}

const props = defineProps<RelationProps>()
const router = useRouter()
const activeAccordion = ref<number>(-1)

const lineageCount = computed(() => {
  let count = 0
  if (props.fromLineage) {
    count += props.fromLineage.organismes.length
  }
  if (props.toLineage) {
    count += props.toLineage.organismes.length
  }
  return count
})
const structuralRelationsCount = computed(() => {
  return (props.founderLegalEntities?.length || 0) + (props.governanceLegalEntities?.length || 0)
})
const foundedCount = computed(() => props.foundedLegalEntities?.length || 0)

const hasRelations = computed(() => {
  return lineageCount.value > 0 || structuralRelationsCount.value > 0 || foundedCount.value > 0
})

const isNavigable = (rawType: string | undefined | null): boolean => {
  if (!rawType) {
    return false
  }
  const t = rawType.toLowerCase()
  return t === 'foundation' || t === 'association'
}

const goToOrganisme = (publicId: string, rawType: string | undefined | null) => {
  if (!publicId || !isNavigable(rawType)) {
    return
  }

  const cleanId = publicId.split(' ')[0]
  const typeLower = rawType!.toLowerCase()

  let idType = 'Rnf'
  if (typeLower === 'association') {
    idType = 'Rna'
  }

  router.push({
    name: routeNames.FICHE_ORGANISME,
    params: { id: cleanId },
    query: { idType, tab: 'infos' },
  })
}

const lineageToString = (lineage: ILineage): string => {
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

onMounted(() => {
  if (lineageCount.value > 0) {
    activeAccordion.value = 0
  } else if (structuralRelationsCount.value > 0) {
    activeAccordion.value = 1
  } else if (foundedCount.value > 0) {
    activeAccordion.value = 2
  }
})
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
        <p v-if="lineageCount === 0" class="fr-text--sm fr-mb-0 italic text-grey">
          Aucun historique de filiation connu.
        </p>

        <div class="lineage-container">
          <div v-if="fromLineage" class="lineage-block">
            <p class="section-label">
              Organismes sources
            </p>

            <div class="cards-grid">
              <div v-for="org in fromLineage.organismes" :key="org.publicId" class="card-wrapper">
                <DsfrCard
                  :title-link-attrs="{}"
                  :class="isNavigable(org.kind) ? 'card-interactive' : 'card-static'"
                  :title="org.publicId"
                  :detail="org.kind"
                  :description="isNavigable(org.kind) ? 'Voir la fiche' : 'Organisme externe'"
                  size="sm"
                  :no-arrow="true"
                  @click="goToOrganisme(org.publicId, org.kind)"
                />
              </div>
            </div>

            <div class="flow-connector">
              <div class="vertical-line" />
              <span class="fr-badge fr-badge--info fr-badge--no-icon fr-my-1w">
                {{ lineageToString(fromLineage) }}
              </span>
              <div class="vertical-line" />
              <VIcon name="ri-arrow-down-line" scale="1.5" class="text-grey" />
            </div>
          </div>

          <div class="w-full flex justify-center my-2">
            <DsfrCard
              :title-link-attrs="{}"
              :title="currentOrganismeTitle"
              description="STRUCTURE ACTUELLE"
              :no-arrow="true"
              class="current-org-card"
            />
          </div>

          <div v-if="toLineage" class="lineage-block">
            <div class="flow-connector">
              <div class="vertical-line" />
              <span class="fr-badge fr-badge--new fr-badge--no-icon fr-my-1w">
                {{ lineageToString(toLineage) }}
              </span>
              <div class="vertical-line" />
              <VIcon name="ri-arrow-down-line" scale="1.5" class="text-grey" />
            </div>

            <p class="section-label">
              A donné lieu à
            </p>

            <div class="cards-grid">
              <div v-for="org in toLineage.organismes" :key="org.publicId" class="card-wrapper">
                <DsfrCard
                  :title-link-attrs="{}"
                  :class="isNavigable(org.kind) ? 'card-interactive' : 'card-static'"
                  :title="org.publicId"
                  :detail="org.kind"
                  :description="isNavigable(org.kind) ? 'Voir la fiche' : 'Nouvelle structure'"
                  size="sm"
                  :no-arrow="true"
                  @click="goToOrganisme(org.publicId, org.kind)"
                />
              </div>
            </div>
          </div>
        </div>
      </DsfrAccordion>

      <DsfrAccordion
        id="structural"
        :title="`Relations structurelles (${structuralRelationsCount})`"
      >
        <h3 class="section-header">
          Fondateurs (Personnes Morales)
        </h3>

        <div v-if="!founderLegalEntities?.length" class="empty-text">
          Aucun fondateur (personne morale) enregistré.
        </div>

        <div v-else class="cards-grid">
          <div v-for="entity in founderLegalEntities" :key="entity.publicId" class="card-wrapper">
            <DsfrCard
              :title-link-attrs="{}"
              :class="isNavigable(entity.type) ? 'card-interactive' : 'card-static'"
              :title="entity.publicId"
              :detail="entity.type"
              :description="isNavigable(entity.type) ? 'Voir la fiche' : 'Entité fondatrice'"
              size="sm"
              :no-arrow="true"
              @click="goToOrganisme(entity.publicId, entity.type)"
            />
          </div>
        </div>

        <h3 class="section-header fr-mt-4w">
          Participation à la gouvernance
        </h3>

        <div v-if="!governanceLegalEntities?.length" class="empty-text">
          Aucune personne morale ne participe à la gouvernance.
        </div>

        <div v-else class="cards-grid">
          <div v-for="entity in governanceLegalEntities" :key="entity.publicId" class="card-wrapper">
            <DsfrCard
              :title-link-attrs="{}"
              :class="isNavigable(entity.type) ? 'card-interactive' : 'card-static'"
              :title="entity.publicId"
              :detail="entity.type"
              :description="isNavigable(entity.type) ? 'Voir la fiche' : 'Membre gouvernance'"
              size="sm"
              :no-arrow="true"
              @click="goToOrganisme(entity.publicId, entity.type)"
            />
          </div>
        </div>
      </DsfrAccordion>

      <DsfrAccordion
        id="founded"
        :title="`Entités créées par cet organisme (${foundedCount})`"
      >
        <div v-if="!foundedLegalEntities?.length" class="empty-text">
          Cet organisme n'a créé aucune autre entité légale.
        </div>

        <div v-else class="cards-grid">
          <div v-for="entity in foundedLegalEntities" :key="entity.publicId" class="card-wrapper">
            <DsfrCard
              :title-link-attrs="{}"
              :class="isNavigable(entity.type) ? 'card-interactive' : 'card-static'"
              :title="entity.publicId"
              :detail="entity.type"
              :description="isNavigable(entity.type) ? 'Voir la fiche' : 'Entité créée'"
              size="sm"
              :no-arrow="true"
              @click="goToOrganisme(entity.publicId, entity.type)"
            />
          </div>
        </div>
      </DsfrAccordion>
    </DsfrAccordionsGroup>
  </div>
</template>

<style scoped>
.italic {
  font-style: italic;
}

.text-grey {
  color: var(--text-mention-grey);
}

.empty-text {
  font-size: 0.9rem;
  color: var(--text-mention-grey);
  margin-bottom: 1rem;
}

.section-header {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-title-grey);
  background-color: var(--background-alt-grey);
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  border-left: 4px solid var(--border-default-grey);
}

.section-label {
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-mention-grey);
  text-align: center;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
}

.cards-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.card-wrapper {
  flex: 1 1 300px;
  max-width: 400px;
  min-width: 250px;
}

.lineage-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.lineage-block {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.flow-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0.5rem 0;
}

.vertical-line {
  width: 2px;
  height: 1.5rem;
  background-color: var(--border-default-grey);
}

.current-org-card {
  border: 2px solid var(--background-action-high-blue-france);
  background-color: var(--background-contrast-blue-france);
  box-shadow: var(--shadow-raised-grey);
  transform: scale(1.02);
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.card-interactive {
  cursor: pointer;
  background-color: var(--background-default-grey);
  transition: all 0.2s ease-in-out;
}

.card-interactive:hover {
  background-color: var(--background-action-low-blue-france);
  box-shadow: var(--shadow-raised-grey);
  border-color: var(--background-action-high-blue-france);
}

.card-static {
  cursor: default;
  background-color: var(--background-alt-grey);
  box-shadow: none;
  border: 1px solid var(--border-default-grey);
  color: var(--text-mention-grey);
}

.card-static:hover {
  background-color: var(--background-alt-grey);
  transform: none;
  box-shadow: none;
}

.card-static :deep(.fr-card__detail .fr-icon-arrow-right-line),
.card-static :deep(.fr-arrow-right-line) {
  display: none !important;
}
</style>
