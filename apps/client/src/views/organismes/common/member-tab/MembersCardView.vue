<script setup lang="ts">
import type { IPerson } from '@biblio-num/shared'
import { dateToStringFr } from '@/utils/date-to-string'
import { getRepresentativeLabel, isSelfRepresented } from './legal-entity.utils'
import InfoRow from '@/views/organismes/components/InfoRow.vue'

defineProps<{
  persons: IPerson[]
}>()

const getJobDisplay = (person: IPerson) => {
  if (person.quality?.toLowerCase().includes('directeur')) {
    return person.quality
  }
  return person.jobPosition || '-'
}

const getBirthLabel = (person: IPerson): string => {
  const { bornAt, bornPlace } = person
  if (!bornAt && !bornPlace) {
    return '-'
  }

  const parts: string[] = []
  if (bornAt) {
    parts.push(dateToStringFr(bornAt))
  }
  if (bornPlace) {
    parts.push(`à ${bornPlace}`)
  }

  return parts.join(' ')
}

const entryExitDateTimelineItems = (person: IPerson) => {
  const items = []

  if (person.entryAt) {
    items.push({
      key: `entry-${person.id}`,
      badgeLabel: 'ENTRÉE',
      badgeType: 'success' as const,
      text: dateToStringFr(person.entryAt),
    })
  }

  if (person.exitAt) {
    items.push({
      key: `exit-${person.id}`,
      badgeLabel: 'SORTIE',
      badgeType: 'warning' as const,
      text: dateToStringFr(person.exitAt),
    })
  }

  return items
}
</script>

<template>
  <div class="flex flex-col gap-y-8">
    <section v-for="person in persons" :key="person.id">
      <div class="flex items-center gap-4 fr-mb-2w">
        <h2 class="fr-h6 fr-mb-0">
          {{ person.lastName.toUpperCase() }} {{ person.firstName }}
        </h2>
        <DsfrBadge
          v-if="person.isFounder"
          label="FONDATEUR"
          type="new"
          no-icon
        />
      </div>

      <div class="fr-background-alt--grey fr-p-2w fr-mb-2v">
        <InfoRow label="Fonction">
          {{ getJobDisplay(person) }}
        </InfoRow>

        <InfoRow label="Dates (entrée / sortie)">
          <HorizontalTimeline :items="entryExitDateTimelineItems(person)">
            <template #empty>
              <span>
                -
              </span>
            </template>
          </HorizontalTimeline>
        </InfoRow>

        <InfoRow label="Représentant">
          {{ getRepresentativeLabel(person) }}
        </InfoRow>

        <div class="fr-mt-2w flex flex-col gap-y-3">
          <template v-if="!isSelfRepresented(person) && person.legalEntity">
            <div class="subinfo-bg px-4 py-2">
              <p class="fr-text--sm fr-mb-1w subinfo-title">
                Informations sur la personne morale
              </p>
              <template v-if="person.legalEntity.publicId">
                <!-- TODO: A compléter une fois disponible -->
                <InfoRow label="Nom de la personne morale">
                  {{ person.legalEntity.name || '-' }}
                </InfoRow>
                <InfoRow label="Numéro d'identifiant">
                  {{ person.legalEntity.publicId || '-' }}
                </InfoRow>
                <InfoRow label="Type de personne morale">
                  {{ person.legalEntity.type || '-' }}
                </InfoRow>
                <InfoRow label="Adresse du siège">
                  {{ person.legalEntity.address?.oneLine || '-' }}
                </InfoRow>
                <InfoRow label="Pays">
                  {{ person.legalEntity.country || '-' }}
                </InfoRow>
              </template>

              <template v-else>
                <InfoRow label="Dénomination">
                  {{ person.legalEntity.name || '-' }}
                </InfoRow>
                <InfoRow label="Type de personne morale">
                  {{ person.legalEntity.type || '-' }}
                </InfoRow>
                <InfoRow label="Adresse du siège">
                  {{ person.legalEntity.address?.oneLine || '-' }}
                </InfoRow>
                <InfoRow label="Pays">
                  {{ person.legalEntity.country || '-' }}
                </InfoRow>
              </template>
            </div>
          </template>
          <div class="subinfo-bg px-4 py-2">
            <p class="fr-text--sm fr-mb-1w subinfo-title">
              Identité de la personne
            </p>
            <InfoRow label="Date et lieu de naissance">
              <template v-if="person.bornAt || person.bornPlace">
                {{ getBirthLabel(person) }}
              </template>
              <template v-else>
                -
              </template>
            </InfoRow>
            <InfoRow label="Nationalité">
              {{ person.nationality || '-' }}
            </InfoRow>
            <InfoRow label="Adresse">
              {{ person.address?.oneLine || '-' }}
            </InfoRow>
            <InfoRow label="Profession">
              {{ person.profession || '-' }}
            </InfoRow>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.subinfo-bg {
  background-color: var(--grey-1000-100);
}
.subinfo-title {
  color: var(--text-action-high-blue-france);
  font: 700
}
</style>
