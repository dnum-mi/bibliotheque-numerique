<script lang="ts" setup>
import { computed } from 'vue'
import type { IDsEventItem } from '@biblio-num/shared'
import { dateToStringFr } from '@/utils'
import { routeNames } from '@/router/route-names'

const props = defineProps<{
  events: IDsEventItem[]
}>()

const router = useRouter()

const sortedEvents = computed(() => {
  return [...props.events].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const getBadgeType = (type: string): 'success' | 'info' | 'error' | 'new' | undefined => {
  const t = type.toUpperCase()
  if (t.includes('CREATION')) {
    return 'success'
  }
  if (t.includes('MODIFICATION')) {
    return 'info'
  }
  if (t.includes('DISSOLUTION')) {
    return 'error'
  }
  return 'new'
}

const formatBadgeLabel = (type: string) => {
  return type.replace(/_/g, ' ')
}

const navigateToDossier = (localId: number | null | undefined) => {
  if (!localId) {
    return
  }

  router.push({
    name: routeNames.DOSSIERS,
    params: { id: localId },
  })
}
</script>

<template>
  <div class="fr-container--fluid fr-p-2w">
    <div
      v-if="sortedEvents.length === 0"
      class="fr-alert fr-alert--info fr-mb-2w"
    >
      <h3 class="fr-alert__title">Aucun historique</h3>
      <p>Aucun événement n'a été trouvé.</p>
    </div>

    <div
      v-else
      class="timeline-container"
    >
      <div
        v-for="event in sortedEvents"
        :key="event.id"
        class="timeline-row"
      >
        <div class="timeline-date">
          <span class="fr-text--md fr-text--bold block-date">
            {{ dateToStringFr(event.createdAt) }}
          </span>
        </div>

        <div class="timeline-content">
          <div class="fr-card fr-card--no-border fr-card--shadow fr-mb-3w">
            <div class="fr-card__body">
              <div class="fr-card__content">
                <div class="fr-mb-1w text-right">
                  <DsfrBadge
                    :type="getBadgeType(event.type)"
                    :label="formatBadgeLabel(event.type)"
                    small
                    no-icon
                  />
                </div>

                <h4 class="fr-card__title fr-text--md fr-mb-2w">
                  {{ event.demarcheName || 'N/A' }}
                </h4>

                <div class="fr-grid-row fr-grid-row--gutters">
                  <div class="fr-col-12 fr-col-md-6">
                    <p class="fr-text--xs fr-mb-0 uppercase-label">N° Dossier</p>
                    <p class="fr-text--sm fr-mb-1w font-mono">
                      {{ event.dossierNumber ?? 'N/A' }}
                    </p>
                  </div>
                  <div class="fr-col-12 fr-col-md-6">
                    <p class="fr-text--xs fr-mb-0 uppercase-label">Instructeur</p>
                    <p class="fr-text--sm fr-mb-1w">
                      {{ event.dossierInstructeurGroup ?? 'N/A' }}
                    </p>
                  </div>
                  <div class="fr-col-12 fr-col-md-6">
                    <p class="fr-text--xs fr-mb-0 uppercase-label">Accepté le</p>
                    <p class="fr-text--sm fr-mb-1w">
                      {{ dateToStringFr(event.acceptedAt) || 'N/A' }}
                    </p>
                  </div>
                  <div class="fr-col-12 fr-col-md-6">
                    <p class="fr-text--xs fr-mb-0 uppercase-label">JOAFE</p>
                    <p class="fr-text--sm fr-mb-1w">
                      {{ dateToStringFr(event.publishedJOAFAt) || 'N/A' }}
                    </p>
                  </div>
                </div>

                <div class="fr-mt-2w fr-pt-2w border-top-light">
                  <div class="flex-right items-center gap-2">
                    <div>
                      <span
                        v-if="!event.dossierLocalNumber"
                        class="fr-text--xs text-grey italic fr-mr-2w"
                      >
                        Dossier non disponible
                      </span>
                    </div>

                    <DsfrButton
                      :label="event.dossierLocalNumber ? 'Voir le dossier' : 'Non importé'"
                      :icon="event.dossierLocalNumber ? 'fr-icon-arrow-right-line' : undefined"
                      icon-right
                      secondary
                      size="sm"
                      :disabled="!event.dossierLocalNumber"
                      @click="navigateToDossier(event.dossierLocalNumber)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Conteneur principal */
.timeline-container {
  display: flex;
  flex-direction: column;
}
.timeline-row {
  display: flex;
  width: 100%;
}

.timeline-date {
  width: 120px;
  min-width: 120px;
  text-align: right;
  padding-right: 1.5rem;
  padding-top: 1.5rem;
}
.block-date {
  display: block;
  color: var(--text-mention-grey);
}

.timeline-content {
  flex-grow: 1;
  border-left: 2px solid var(--border-default-grey);
  padding-left: 1.5rem;
  padding-bottom: 1rem;
  position: relative;
}
.timeline-content::before {
  content: '';
  position: absolute;
  left: -0.52rem;
  top: 1.8rem;
  width: 0.9rem;
  height: 0.9rem;
  background-color: var(--background-action-high-blue-france);
  border-radius: 50%;
  border: 2px solid var(--background-default-grey);
}

/* Utils Text */
.label-xs {
  text-transform: uppercase;
  color: var(--text-mention-grey);
  font-weight: 700;
  font-size: 0.7rem;
  margin-bottom: 0.25rem;
  letter-spacing: 0.5px;
}
.text-right {
  text-align: right;
}
.font-mono {
  font-family: monospace;
}
.text-grey {
  color: var(--text-mention-grey);
}
.italic {
  font-style: italic;
}

/* Listes compactes */
.compact-list {
  list-style: none;
}
.compact-list li {
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

/* IMPORTANT : Préserve les sauts de ligne \r\n de l'objet social */
.pre-wrap-text {
  white-space: pre-line;
  font-size: 0.85rem;
  line-height: 1.4;
}

/* Espacement entre les blocs de l'accordéon */
.section-block {
  margin-bottom: 1rem;
}

/* Borders */
.border-top-light {
  border-top: 1px solid var(--border-default-grey);
}
.border-before-section {
  border-top: 1px dashed var(--border-default-grey);
  padding-top: 0.5rem;
}
.flex-right {
  display: flex;
  justify-content: flex-end;
}
</style>
