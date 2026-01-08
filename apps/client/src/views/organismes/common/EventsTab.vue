<script lang="ts" setup>
import { computed } from 'vue'
import type {
  IRnaEventOutput,
  IDsEventItem,
  RnaEventModificationDetail,
  IRafEvent,
} from '@biblio-num/shared'
import { dateToStringFr, getPrefecture } from '@/utils'
import { routeNames } from '@/router/route-names.ts'

const props = defineProps<{
  events: (IRafEvent | IDsEventItem | IRnaEventOutput)[]
}>()

const router = useRouter()

const sortedEvents = computed(() => {
  return props.events
    ? [...props.events].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : []
})

const getBadgeType = (event: IDsEventItem): 'success' | 'info' | 'error' | 'new' | undefined => {
  if (event.isDissolution) {
    return 'error'
  }
  const t = event.type.normalize('NFD').toUpperCase()
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

const formatBadgeLabel = (event: IDsEventItem): string => {
  if (event.isDissolution) {
    return 'Dissolution'
  }
  return event.type.replace(/^ds/g, ' ')
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

const transformDataBefore = (str: string | undefined): string => {
  if (!str) {
    return ''
  }
  return str
    .split('||')
    .map((t) => {
      const d = t.split('==')
      if (d?.[1] && d?.[1] !== '') {
        return `${d[0]}: ${d[1]}`
      }
      return null
    })
    .filter((a) => !!a)
    .join(',  ')
}
</script>

<template>
  <div class="fr-container--fluid fr-p-2w">
    <div v-if="sortedEvents.length === 0">
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
          <div
            class="fr-card fr-card--no-border fr-card--shadow fr-mb-3w"
            :class="(event as IDsEventItem).demarcheNumber ? 'ds-card' : 'rna-card'"
          >
            <p class="event-type">
              {{ (event as IDsEventItem).demarcheNumber ? 'Dossier DS' : 'Évènement RNA' }}
            </p>
            <div class="fr-card__body">
              <div class="fr-card__content">
                <div class="fr-display-flex fr-justify-content-between fr-align-items-start fr-mb-3w">
                  <DsfrBadge
                    :type="getBadgeType((event as IDsEventItem))"
                    :label="formatBadgeLabel((event as IDsEventItem))"
                    small
                    no-icon
                  />
                </div>

                <!-- Ds event TODO: good type -->
                <template v-if="(event as IDsEventItem).demarcheNumber">
                  <div
                    v-if="(event as IDsEventItem).demarcheNumber"
                    class="fr-card__title fr-mt-2w"
                  >
                    <router-link
                      v-if="(event as IDsEventItem).demarcheLocalId"
                      :to="{ name: routeNames.DEMARCHE_DOSSIERS, params: { demarcheId: (event as IDsEventItem).demarcheLocalId } }"
                      class="fr-link fr-text--lg text-title"
                    >
                      {{ (event as IDsEventItem).demarcheLocalName }}
                    </router-link>

                    <div
                      v-else
                      class="fr-display-flex fr-items-center flex-wrap gap-2"
                    >
                      <span class="fr-text--lg fr-text--bold text-grey fr-mr-2w">
                        {{ (event as IDsEventItem).demarcheName || 'Démarche indéterminée' }}
                      </span>
                      <DsfrBadge
                        label="Non importée"
                        type="new"
                        small
                        no-icon
                      />
                    </div>
                  </div>

                  <div class="fr-grid-row fr-grid-row--gutters">
                    <div class="fr-col-12 fr-col-md-4">
                      <p class="uppercase-label">
                        Instructeur
                      </p>
                      <p class="fr-text--sm fr-mb-1w">
                        {{ (event as IDsEventItem).dossierInstructeurGroup ? getPrefecture((event as IDsEventItem).dossierInstructeurGroup) : 'N/A' }}
                      </p>
                    </div>

                    <div class="fr-col-6 fr-col-md-4">
                      <p class="uppercase-label">
                        Accepté le
                      </p>
                      <p class="fr-text--sm fr-mb-1w">
                        {{ dateToStringFr((event as IDsEventItem).acceptedAt) || 'N/A' }}
                      </p>
                    </div>

                    <div class="fr-col-6 fr-col-md-4">
                      <p class="uppercase-label">
                        JOAFE
                      </p>
                      <p class="fr-text--sm fr-mb-1w">
                        {{ dateToStringFr((event as IDsEventItem).joPublishedAt) || 'N/A' }}
                      </p>
                    </div>
                  </div>

                  <div
                    v-if="(event as IDsEventItem).dossierNumber"
                    class="flex justify-between fr-mt-2w fr-pt-2w border-top-light"
                  >
                    <div class="dossier-identifier">
                      <div><span class="fr-text--xs uppercase-label fr-mr-1v">Dossier :</span></div>
                      <div>
                        <span class="fr-text--sm font-mono fr-text--bold text-dark">
                          {{ (event as IDsEventItem).dossierNumber ?? 'N/A' }}
                        </span>
                      </div>
                    </div>
                    <div class="fr-display-flex fr-items-center gap-2">
                      <span
                        v-if="!(event as IDsEventItem).dossierLocalNumber"
                        class="fr-text--xs text-grey italic fr-mr-2w"
                      >
                        Dossier non disponible
                      </span>
                      <DsfrButton
                        :label="(event as IDsEventItem).dossierLocalNumber ? 'Voir le dossier' : 'Non importé'"
                        :icon="(event as IDsEventItem).dossierLocalNumber ? 'fr-icon-arrow-right-line' : undefined"
                        icon-right
                        secondary
                        size="sm"
                        :disabled="!(event as IDsEventItem).dossierLocalNumber"
                        @click="navigateToDossier((event as IDsEventItem).dossierLocalNumber)"
                      />
                    </div>
                  </div>
                </template>

                <template v-else>
                  <div class="fr-grid-row fr-grid-row--gutters">
                    <div class="fr-col-12 fr-col-md-4">
                      <p class="uppercase-label">
                        Date de publication au JOAFF
                      </p>
                      <p class="fr-text--sm fr-mb-1w">
                        {{ dateToStringFr((event as IRnaEventOutput).joPublishedAt) }}
                      </p>
                    </div>

                    <div
                      v-if="(event as IRnaEventOutput).dissolutionType"
                      class="fr-col-6 fr-col-md-4"
                    >
                      <p class="uppercase-label">
                        Type de dissolution
                      </p>
                      <p class="fr-text--sm fr-mb-1w">
                        {{ (event as IRnaEventOutput).dissolutionType }}
                      </p>
                    </div>

                    <div
                      v-if="(event as IRnaEventOutput).modificationDetails"
                      class="fr-col-6 fr-col-md-4"
                    >
                      <p class="uppercase-label">
                        Type de modification
                      </p>
                      <div class="flex flex-col">
                        <template
                          v-for="(m, index) in (event as IRnaEventOutput).modificationDetails"
                          :key="index"
                        >
                          <div class="flex items-center">
                            <CustomTooltip
                              :content="transformDataBefore((m as RnaEventModificationDetail)?.valueBefore)"
                            >
                              <p class="m-0">
                                {{ m.type }}
                              </p>
                            </CustomTooltip>
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.uppercase-label {
  text-transform: uppercase;
  color: var(--text-mention-grey);
  font-weight: 700;
  font-size: 0.7rem;
  margin-bottom: 0.25rem;
  letter-spacing: 0.5px;
  line-height: 1;
}

.dossier-identifier {
  display: flex;
  align-items: center;
  border-radius: 4px;
}

.font-mono {
  font-family: monospace;
}

.text-grey {
  color: var(--text-mention-grey);
}

.text-dark {
  color: var(--text-title-grey);
}

.italic {
  font-style: italic;
}

.text-title {
  color: var(--text-title-grey);
  text-decoration: none;
  background-image: none;
  font-weight: 700;
}

.text-title:hover {
  text-decoration: underline;
}

.border-top-light {
  border-top: 1px solid var(--border-default-grey);
}

.ds-card {
  position: relative;
  background: white !important;
}

.rna-card {
  position: relative;
  background: var(--grey-925-125) !important;
}

.event-type {
  font-style: italic;
  color: var(--text-mention-grey);
  position: absolute;
  top:10px;
  right:10px;
}
</style>
