<script setup lang="ts">
import type { IFoundationOutput } from '@biblio-num/shared'
import { EOrganismeCategory } from '@biblio-num/shared'
import type { tInfoIdentity } from '../common/info-tab/InfoSectionIdentity.vue'
import InfoSectionIdentity from '../common/info-tab/InfoSectionIdentity.vue'
import type { tInfoActivity } from '@/views/organismes/common/info-tab/InfoSectionActivity.vue'
import InfoSectionActivity from '@/views/organismes/common/info-tab/InfoSectionActivity.vue'
import type { tInfoCompte } from '@/views/organismes/common/info-tab/InfoSectionCompte.vue'
import InfoSectionCompte from '@/views/organismes/common/info-tab/InfoSectionCompte.vue'
import LastHubUpdate from '../components/LastHubUpdate.vue'

const props = defineProps<{
  foundation: IFoundationOutput
}>()

const identity = computed<tInfoIdentity>(() => ({
  id: props.foundation.id,
  title: props.foundation.title,
  type: EOrganismeCategory.fondation,
  siret: props.foundation.siret,
  email: props.foundation.email,
  phone: props.foundation.phone,
  address: props.foundation.address,
  events: props.foundation.events,
}))

const activity = computed<tInfoActivity>(() => ({
  socialObject: props.foundation.socialObject,
  generalInterestDomain: props.foundation.generalInterestDomain,
  hasInternationalActivity: props.foundation.hasInternationalActivity,
}))

const compte = computed<tInfoCompte>(() => ({
  files: props.foundation.files,
  fiscalEndDateAt: props.foundation.fiscalEndAt,
  creationAt: props.foundation.creationAt,
  accountDepositYears: props.foundation.accountDepositYears,
  publicGenerosityYears: props.foundation.publicGenerosityYears,
  publicSubsidyYears: props.foundation.publicSubsidyYears,
  foreignFinancingYears: props.foundation.foreignFinancingYears,
}))
</script>

<template>
  <div class="fr-container fr-py-4w flex flex-col gap-y-5">
    <LastHubUpdate :timestamp="foundation.hub_timestamp" />
    <InfoSectionIdentity :identity />
    <InfoSectionActivity :activity />
    <InfoSectionCompte
      :organisme-id="foundation.id"
      :compte
      :organisme-type="EOrganismeCategory.fondation"
    />
  </div>
</template>
