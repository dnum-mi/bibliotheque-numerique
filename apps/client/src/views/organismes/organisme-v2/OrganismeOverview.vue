<script setup lang="ts">
import type { siafV2 } from '@biblio-num/shared'
import { dateToStringFr, getPrefecture } from '@/utils'

const props = withDefaults(
  defineProps<{
    organisme: siafV2.IAssociationOutput | siafV2.IFoundationOutput
    isFoundation: boolean
  }>(),
  {},
)

const asFoundation = computed(() => {
  return props.isFoundation ? (props.organisme as siafV2.IFoundationOutput) : null
})

const asAssociation = computed(() => {
  return !props.isFoundation ? (props.organisme as siafV2.IAssociationOutput) : null
})

const mapCenter = computed(() => props.organisme.address.coordinates)
const zoom = ref(12)
const mapCard = ref<HTMLElement>()
const mapCardRef = useTemplateRef('mapCard')
</script>

<template>
  <div class="py-6 px-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
    <div class="flex flex-col gap-8">
      <div>
        <div class="px-4 sm:px-0">
          <h3 class="text-base/7 font-semibold text-gray-900 mb-0 fr-background-alt--grey fr-py-3v fr-px-2w">Identité</h3>
        </div>
        <div class="mt-6 border-t border-gray-100">
          <dl class="divide-y p-0">
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">SIRET du siège social</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ organisme.siret || 'Non renseigné' }}
              </dd>
            </div>
            <div v-if="!isFoundation" class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">Domaine d'activité</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ `${asAssociation?.activityDomainCode} - ${asAssociation?.activityDomainDescription}` || 'Non renseigné' }}
              </dd>
            </div>
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">Objet social</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ organisme.socialObject || 'Non renseigné' }}
              </dd>
            </div>
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">Date du terme</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ dateToStringFr(organisme?.dueDate) || 'Non renseigné' }}
              </dd>
            </div>
            <div v-if="isFoundation" class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">A une activité internationale</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ asFoundation?.hasInternationalActivity ? 'Oui' : 'Non' }}
              </dd>
            </div>
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">Date de clôture de l'exercice comptable (jour/mois)</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ dateToStringFr(asAssociation?.fiscalEndAt) || 'Non renseigné' }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div>
        <div class="px-4 sm:px-0">
          <h3 class="text-base/7 font-semibold text-gray-900 mb-0 fr-background-alt--grey fr-py-3v fr-px-2w">
            Activité
          </h3>
        </div>
        <div class="mt-6 border-t border-gray-100">
          <dl class="divide-y p-0">
            <div v-if="!isFoundation" class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">Domaine d'activité</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ `${asAssociation?.activityDomainCode} - ${asAssociation?.activityDomainDescription}` || 'Non renseigné' }}
              </dd>
            </div>
            <div v-if="isFoundation" class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">Domaine d'intérêt général</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ asFoundation?.generalInterestDomain || 'Non renseigné' }}
              </dd>
            </div>
            <div v-if="isFoundation" class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">Activité à l'international</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ asFoundation?.hasInternationalActivity ? 'OUI' : 'NON' }}
              </dd>
            </div>
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">Appel à la générosité publique (années)</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ organisme.publicGenerosityYears.join(' - ') || 'Aucune' }}
              </dd>
            </div>
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">Subventions publiques (années)</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ organisme.publicSubsidyYears.join(' - ') || 'Aucune' }}
              </dd>
            </div>
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">Financements étrangers (années)</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ organisme.foreignFinancingYears.join(' - ') || 'Aucune' }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div>
        <div class="px-4 sm:px-0">
          <h3 class="text-base/7 font-semibold text-gray-900 mb-0 fr-background-alt--grey fr-py-3v fr-px-2w">
            Compte
          </h3>
        </div>
        <div class="mt-6 border-t border-gray-100">
          <dl class="divide-y p-0">
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">Dépôts des comptes</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ organisme.accountDepositYears.join(' - ') || 'Aucune' }}
              </dd>
            </div>
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">Date de clôture de l'exercice comptable (jour/mois)</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ dateToStringFr(organisme.fiscalEndAt) || 'Non renseigné' }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-8">
      <div>
        <div class="px-4 sm:px-0">
          <h3 class="text-base/7 font-semibold text-gray-900 mb-0 fr-background-alt--grey fr-py-3v fr-px-2w">Contact</h3>
        </div>
        <div class="mt-6 border-t border-gray-100">
          <dl class="divide-y p-0">
            <div
              v-if="mapCenter && mapCenter.length"
              class="flex-basis-[30%] flex-shrink-0 flex-grow-0 inline-block"
            >
              <div class="h-[250px] w-[250px] relative">
                <MapCard
                  ref="mapCard"
                  :zoom
                  :center="mapCenter"
                  pin-marker
                />
                <DsfrButton
                  type="button"
                  icon="ri-focus-3-line"
                  tertiary
                  title="Recentrer la carte"
                  class="rounded-full self-end absolute top-0 right-0"
                  icon-only
                  @click="mapCardRef?.resetCenter()"
                />
              </div>
            </div>
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">Adresse du siège</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ organisme.address.oneLine }}
              </dd>
            </div>
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">Email</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ organisme.email }}
              </dd>
            </div>
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">Téléphone</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ organisme.phone }}
              </dd>
            </div>
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">Site web</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ organisme.website }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div v-if="!isFoundation">
        <div class="px-4 sm:px-0">
          <h3 class="text-base/7 font-semibold text-gray-900 mb-0 fr-background-alt--grey fr-py-3v fr-px-2w">Agrément</h3>
        </div>
        <div class="mt-6 border-t border-gray-100">
          <dl class="divide-y p-0">
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">Type</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ asAssociation?.quality?.type }}
              </dd>
            </div>
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">Date de début</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ dateToStringFr(asAssociation?.quality?.startedAt) }}
              </dd>
            </div>
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">Date de fin</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ dateToStringFr(asAssociation?.quality?.endedAt) }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.divide-y > :not(:last-child) {
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-color: rgb(243 244 246);
}
</style>
