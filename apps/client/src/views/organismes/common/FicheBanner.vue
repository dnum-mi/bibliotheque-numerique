<script lang='ts' setup=''>
import type {
  OrganismeStatusKey,
  OrganismeTypeKey,
} from '@biblio-num/shared'
import { dateToStringFr } from '@/utils'

export type tInfoBanner = {
  id: string,
  title: string,
  state: OrganismeStatusKey,
  stateEffectiveAt: Date | null,
  hub_timestamp?: Date,
  creationAt: Date,
  typeOrg: OrganismeTypeKey | string,
}

defineProps<{
  banner: tInfoBanner,
}>()
</script>

<template>
  <div class="flex flex-grow gap-2 justify-between items-center">
    <div class="flex">
      <OrganismeBadge
        :type="banner.typeOrg"
        class="mr-4"
        big
      />
      <div class="flex flex-col">
        <div>
          <span class="fr-text--lead fr-text--bold">{{ banner.id }}</span>
          <span class="fr-text--lead">{{ ` ${banner.title}` }}</span>
        </div>
        <div>
          <span :class="banner.state === 'Active' ? 'ASSO' : banner.state">
            <strong>
              {{ banner.state }}
            </strong>
          </span>
          <span class="text-sm">
            depuis le {{ dateToStringFr(banner.stateEffectiveAt) }}
          </span>
        </div>
      </div>
    </div>
    <div class="flex-row gap-4">
      <div class="flex gap-4">
        <label class="bn-fiche-sub-title--label dark uppercase">Crée le:</label>
        <span class="bn-fiche-sub-title--text">{{ dateToStringFr(banner.creationAt) }}</span>
      </div>
      <div class="flex gap-4">
        <label class="bn-fiche-sub-title--label dark uppercase">Synchronisé:</label>
        <span class="bn-fiche-sub-title--text">{{ dateToStringFr(banner.hub_timestamp) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
span.ASSO {
  color: var(--background-contrast-yellow-moutarde);
}

span.FDD {
  color: #fee7fc;
}

span.FE {
  color: #fef4f2;
}

span.FRUP {
  color: var(--green-tilleul-verveine-975-75);
}
</style>
