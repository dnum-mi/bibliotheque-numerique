<script setup lang="ts">
import type { IAssociationOutput } from '@biblio-num/shared'
import { EOrganismeCategory } from '@biblio-num/shared'
import type { tInfoIdentity } from '../../common/info-tab/InfoSectionIdentity.vue'
import InfoSectionIdentity from '../../common/info-tab/InfoSectionIdentity.vue'
import type { tInfoActivity } from '../../common/info-tab/InfoSectionActivity.vue'
import InfoSectionActivity from '../../common/info-tab/InfoSectionActivity.vue'
import type { tInfoCompte } from '@/views/organismes/common/info-tab/InfoSectionCompte.vue'
import InfoSectionCompte from '@/views/organismes/common/info-tab/InfoSectionCompte.vue'
import InfoSectionQuality from '@/views/organismes/association/info-tab/InfoSectionQuality.vue'
import LastHubUpdate from '../../components/LastHubUpdate.vue'

const props = defineProps<{
  association: IAssociationOutput
}>()

const identity = computed<tInfoIdentity>(() => ({
  id: props.association.id,
  title: props.association.title,
  type: EOrganismeCategory.association,
  siret: props.association.siret,
  email: props.association.email,
  phone: props.association.phone,
  address: props.association.address,
  events: props.association.events,
}))

const activity = computed<tInfoActivity>(() => ({
  socialObject: props.association.socialObject,
  hasInternationalActivity: props.association.hasInternationalActivity,
}))

const compte = computed<tInfoCompte>(() => ({
  files: props.association.files,
  creationAt: props.association.creationAt,
  dueDate: props.association.dueDate,
  fiscalEndDateAt: props.association.fiscalEndAt,
  accountDepositYears: props.association.accountDepositYears,
  publicGenerosityYears: props.association.publicGenerosityYears,
  publicSubsidyYears: props.association.publicSubsidyYears,
  foreignFinancingYears: props.association.foreignFinancingYears,
}))
</script>

<template>
  <div class="fr-container fr-py-4w flex flex-col gap-y-5">
    <LastHubUpdate :timestamp="association.hub_timestamp" />
    <InfoSectionIdentity :identity />
    <InfoSectionActivity :activity />
    <!-- pas de qualite pour le moment -->
    <InfoSectionQuality :association />
    <InfoSectionCompte
      :organisme-id="association.id"
      :compte
      :organisme-type="EOrganismeCategory.association"
    />
  </div>
</template>
