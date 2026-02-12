<script setup lang="ts">
import { dateToStringFr } from '@/utils'
import type {
  IDsEventItem,
  IRafEvent,
  IRnaEventOutput,
  ISiafAddress,
  organismeCategoryKey,
} from '@biblio-num/shared'
import InfoRow from '@/views/organismes/components/InfoRow.vue'
import { formatSiret } from '@/utils/format-siret'
import type { ITimelineItem, TBadgeTypes } from '@/components/HorizontalTimeline.vue'
import { EOrganismeCategory } from '@biblio-num/shared'

export type tInfoIdentity = {
  id: string
  title: string
  type: organismeCategoryKey
  siret: string | null
  address: ISiafAddress,
  email: string,
  phone: string,
  events: (IRafEvent | IDsEventItem | IRnaEventOutput)[],
}

const props = defineProps<{
  identity: tInfoIdentity
}>()

const joafeTimelineItems = computed<ITimelineItem[]>(() => {
  if (!props.identity.events) {
    return []
  }

  return props.identity.events
    .filter(e => !!e.joPublishedAt)
    .sort((a, b) => new Date(a.joPublishedAt!).getTime() - new Date(b.joPublishedAt!).getTime())
    .map(event => {
      const type = event.type?.toLowerCase() || ''
      let config = { label: 'ÉVÈNEMENT', type: 'info' as TBadgeTypes }

      if (type.includes('création')) {
        config = { label: 'CRÉATION', type: 'success' as const }
      } else if (type.includes('modification')) {
        config = { label: 'MODIFICATION', type: 'new' as const }
      } else if (type.includes('dissolution')) {
        config = { label: 'DISSOLUTION', type: 'error' as const }
      }

      return {
        key: event.id,
        badgeLabel: config.label,
        badgeType: config.type,
        text: dateToStringFr(event.joPublishedAt),
      }
    })
})
</script>

<template>
  <section>
    <h2 class="fr-h4">
      Identité
    </h2>
    <div class="fr-background-alt--grey fr-p-2w">
      <InfoRow label="Titre de la structure">
        {{ identity.title || '-' }}
      </InfoRow>
      <InfoRow :label="`Numéro ${identity.type === EOrganismeCategory.association ? 'RNA' : 'RNF'}`">
        {{ identity.id || '-' }}
      </InfoRow>
      <InfoRow label="SIRET du siège social">
        {{ formatSiret(identity.siret) || '-' }}
      </InfoRow>
      <InfoRow label="Adresse du siège social">
        {{ identity.address?.oneLine || '-' }}
      </InfoRow>
      <InfoRow label="Courriel">
        <a
          v-if="identity.email"
          :href="`mailto:${identity.email}`"
          class="fr-link"
        >
          {{ identity.email }}
        </a>
        <span v-else>-</span>
      </InfoRow>
      <InfoRow label="Numéro de téléphone">
        {{ identity.phone || '-' }}
      </InfoRow>
      <InfoRow label="Publication au JOAFE">
        <HorizontalTimeline :items="joafeTimelineItems">
          <template #empty>
            Aucune publication
          </template>
        </HorizontalTimeline>
      </InfoRow>
    </div>
  </section>
</template>
