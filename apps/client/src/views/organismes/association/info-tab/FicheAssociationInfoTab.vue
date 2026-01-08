<script setup lang="ts">
import type { IAssociationOutput } from '@biblio-num/shared'
import { EOrganismeCategory } from '@biblio-num/shared'

import { getDepartmentCodeFromCodeInsee, getPrefecture } from '@/utils'
import type { tInfoIdentity } from '../../common/info-tab/InfoSectionIdentity.vue'
import InfoSectionIdentity from '../../common/info-tab/InfoSectionIdentity.vue'
import type { tInfoContact } from '../../common/info-tab/InfoSectionContact.vue'
import InfoSectionContact from '../../common/info-tab/InfoSectionContact.vue'
import type { tInfoActivity } from '../../common/info-tab/InfoSectionActivity.vue'
import InfoSectionActivity from '../../common/info-tab/InfoSectionActivity.vue'
import type { tInfoCompte } from '@/views/organismes/common/info-tab/InfoSectionCompte.vue'
import InfoSectionCompte from '@/views/organismes/common/info-tab/InfoSectionCompte.vue'

const props = defineProps<{
  association: IAssociationOutput
}>()

const serviceInstructeur = computed(() => {
  const instructeurGroup = props.association.events?.[0]?.dossierInstructeurGroup
  if (!instructeurGroup) {
    return 'Non renseigné'
  }
  return getPrefecture(instructeurGroup)
})

const identity = computed<tInfoIdentity>(() => ({
  siret: props.association.siret,
  state: props.association.state,
  serviceInstructeur: serviceInstructeur.value || 'Pas de service instructeur',
  socialObject: props.association.socialObject,
  department: props.association.department
    || props.association.address.dsAddress?.departmentCode
    || getDepartmentCodeFromCodeInsee(props.association.address.rnaAddress?.rnaAddress?.codeinsee),
  dueDate: props.association.dueDate,
  files: props.association.files,
  id: props.association.id,
  type: EOrganismeCategory.association,
  events: props.association.events,
}))

const contact = computed<tInfoContact>(() => ({
  email: props.association.email,
  phone: props.association.phone,
  website: props.association.website,
  address: props.association.address,
}))

const activity = computed<tInfoActivity>(() => ({
  hasInternationalActivity: props.association.hasInternationalActivity,
  publicGenerosityYears: props.association.publicGenerosityYears,
  publicSubsidyYears: props.association.publicSubsidyYears,
  foreignFinancingYears: props.association.foreignFinancingYears,
}))

const compte = computed<tInfoCompte>(() => ({
  files: props.association.files,
  fiscalEndAt: props.association.fiscalEndAt,
  creationAt: props.association.creationAt,
  accountDepositYears: props.association.accountDepositYears,
}))
</script>

<template>
  <div class="py-6 px-4 grid grid-cols-1 gap-6 xl:grid-cols-2">
    <InfoSectionIdentity :identity />
    <InfoSectionContact :contact />
    <InfoSectionActivity :activity />
    <InfoSectionCompte
      :organisme-id="association.id"
      :compte
      :organisme-type="EOrganismeCategory.association"
    />
    <!-- pas de qualite pour le moment -->
    <!-- <InfoSectionQuality :association /> -->
  </div>
</template>

<style>
.divide-y > :not(:last-child) {
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-color: rgb(243 244 246);
}
</style>
