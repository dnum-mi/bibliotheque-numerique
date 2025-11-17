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
        <div v-if="!isFoundation" class="py-2 sm:grid sm:grid-cols-5">
          <dt class="text-sm/6 font-medium text-gray-900">
            Domaine d'activité
          </dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
            {{ `${asAssociation?.activityDomainCode} - ${asAssociation?.activityDomainDescription}` || 'Non renseigné' }}
          </dd>
        </div>
        <div v-if="isFoundation" class="py-2 sm:grid sm:grid-cols-5">
          <dt class="text-sm/6 font-medium text-gray-900">
            Domaine d'intérêt général
          </dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
            {{ asFoundation?.generalInterestDomain || 'Non renseigné' }}
          </dd>
        </div>
        <div v-if="isFoundation" class="py-2 sm:grid sm:grid-cols-5">
          <dt class="text-sm/6 font-medium text-gray-900">
            Activité à l'international
          </dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
            {{ asFoundation?.hasInternationalActivity ? 'OUI' : 'NON' }}
          </dd>
        </div>
        <div class="py-2 sm:grid sm:grid-cols-5">
          <dt class="text-sm/6 font-medium text-gray-900">
            Appel à la générosité publique (années)
          </dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
            {{ organisme.publicGenerosityYears?.join(' - ') || 'Aucune' }}
          </dd>
        </div>
        <div class="py-2 sm:grid sm:grid-cols-5">
          <dt class="text-sm/6 font-medium text-gray-900">
            Subventions publiques (années)
          </dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
            {{ organisme.publicSubsidyYears?.join(' - ') || 'Aucune' }}
          </dd>
        </div>
        <div class="py-2 sm:grid sm:grid-cols-5">
          <dt class="text-sm/6 font-medium text-gray-900">
            Financements étrangers (années)
          </dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
            {{ organisme.foreignFinancingYears?.join(' - ') || 'Aucune' }}
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
