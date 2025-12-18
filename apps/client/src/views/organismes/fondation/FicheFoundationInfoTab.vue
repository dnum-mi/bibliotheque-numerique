<script setup lang="ts">
import type { IFoundationOutput } from '@biblio-num/shared'
import { EOrganismeCategory } from '@biblio-num/shared'

import { getPrefecture } from '@/utils'
import type { tInfoIdentity } from '../common/info-tab/InfoSectionIdentity.vue'
import InfoSectionIdentity from '../common/info-tab/InfoSectionIdentity.vue'
import type { tInfoContact } from '@/views/organismes/common/info-tab/InfoSectionContact.vue'
import InfoSectionContact from '@/views/organismes/common/info-tab/InfoSectionContact.vue'
import type { tInfoActivity } from '@/views/organismes/common/info-tab/InfoSectionActivity.vue'
import InfoSectionActivity from '@/views/organismes/common/info-tab/InfoSectionActivity.vue'
import type { tInfoCompte } from '@/views/organismes/common/info-tab/InfoSectionCompte.vue'
import InfoSectionCompte from '@/views/organismes/common/info-tab/InfoSectionCompte.vue'

const props = defineProps<{
  foundation: IFoundationOutput
}>()

const serviceInstructeur = computed(() => {
  const instructeurGroup = props.foundation.events?.[0]?.dossierInstructeurGroup
  if (!instructeurGroup) {
    return 'Non renseigné'
  }
  return getPrefecture(instructeurGroup)
})

const identity = computed<tInfoIdentity>(() => ({
  siret: props.foundation.siret,
  state: props.foundation.state,
  serviceInstructeur: serviceInstructeur.value,
  socialObject: props.foundation.socialObject,
  department: props.foundation.department,
  dueDate: props.foundation.dueDate,
  files: props.foundation.files,
  id: props.foundation.id,
  type: EOrganismeCategory.fondation,
}))

const contact = computed<tInfoContact>(() => ({
  email: props.foundation.email,
  phone: props.foundation.phone,
  website: props.foundation.website,
  address: props.foundation.address,
}))

const activity = computed<tInfoActivity>(() => ({
  hasInternationalActivity: props.foundation.hasInternationalActivity,
  publicGenerosityYears: props.foundation.publicGenerosityYears,
  publicSubsidyYears: props.foundation.publicSubsidyYears,
  foreignFinancingYears: props.foundation.foreignFinancingYears,
}))

const compte = computed<tInfoCompte>(() => ({
  files: props.foundation.files,
  fiscalEndAt: props.foundation.fiscalEndAt,
  creationAt: props.foundation.creationAt,
  accountDepositYears: props.foundation.accountDepositYears,
}))
</script>

<template>
  <div class="py-6 px-4 grid grid-cols-1 gap-6 xl:grid-cols-2">
    <InfoSectionIdentity :identity />
    <InfoSectionContact :contact />
    <InfoSectionActivity :activity />
    <InfoSectionCompte
      :organisme-id="foundation.id"
      :compte
      :organisme-type="EOrganismeCategory.fondation"
    />
  </div>
</template>

<style>
.divide-y > :not(:last-child) {
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-color: rgb(243 244 246);
}
</style>
