<script setup lang="ts">
import type { IAssociationOutput, IFoundationOutput } from '@biblio-num/shared'

const props = withDefaults(
  defineProps<{
    organisme: IAssociationOutput | IFoundationOutput
    isFoundation: boolean
  }>(),
  {},
)

const asFoundation = computed(() => {
  return props.isFoundation ? (props.organisme as IFoundationOutput) : null
})

const asAssociation = computed(() => {
  return !props.isFoundation ? (props.organisme as IAssociationOutput) : null
})
</script>

<template>
  <div>
    <div class="px-4 sm:px-0">
      <h3 class="text-base/7 font-semibold text-gray-900 mb-0 fr-background-alt--grey fr-py-3v fr-px-2w">
        Activité
      </h3>
    </div>
    <div class="mt-6 border-t border-gray-100">
      <dl class="divide-y p-0">
        <div v-if="!isFoundation" class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Domaine d'activité
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            {{ `${asAssociation?.activityDomainCode} - ${asAssociation?.activityDomainDescription}` || 'Non renseigné' }}
          </dd>
        </div>
        <div v-if="isFoundation" class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Domaine d'intérêt général
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            {{ asFoundation?.generalInterestDomain || 'Non renseigné' }}
          </dd>
        </div>
        <div v-if="isFoundation" class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Activité à l'international
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            {{ asFoundation?.hasInternationalActivity ? 'OUI' : 'NON' }}
          </dd>
        </div>
        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Appel à la générosité publique (années)
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            {{ organisme.publicGenerosityYears?.join(' - ') || 'Aucune' }}
          </dd>
        </div>
        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Subventions publiques (années)
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            {{ organisme.publicSubsidyYears?.join(' - ') || 'Aucune' }}
          </dd>
        </div>
        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Financements étrangers (années)
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            {{ organisme.foreignFinancingYears?.join(' - ') || 'Aucune' }}
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
