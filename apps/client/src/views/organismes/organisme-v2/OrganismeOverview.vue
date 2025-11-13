<script setup lang="ts">
import { dateToStringFr } from '@/utils'
import { eTypeFile } from '@biblio-num/shared'
import type { IAssociationOutput, IFoundationOutput } from '@biblio-num/shared'
import FicheIdentity from '../organisme/components/FicheIdentity.vue'
import type { DsfrBadgeProps } from '@gouvminint/vue-dsfr'
import { formatBytes, getFileDetail, getFileFormat } from '@/utils/file.utils'

const props = withDefaults(
  defineProps<{
    organisme: IAssociationOutput | IFoundationOutput
    missingDeclarationYears?: number[]
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

const mapCenter = computed(() => props.organisme.address.coordinates)
const zoom = ref(12)
const mapCard = ref<HTMLElement>()
const mapCardRef = useTemplateRef('mapCard')

const fiscalEndDateAt = computed(() => {
  return (
    props.organisme?.fiscalEndAt
      ? new Intl.DateTimeFormat('fr-FR', {
          day: '2-digit',
          month: '2-digit',
        }).format(new Date(props.organisme.fiscalEndAt))
      : 'Non renseigné'
  )
})

const stateOfFilingOfAccounts = computed<{
  label: string
  type: DsfrBadgeProps['type']
}>(() =>
  !props.missingDeclarationYears?.length
    ? {
        label: 'OK',
        type: 'info',
      }
    : {
        label: 'HORS DELAI',
        type: 'error',
      },
)

// TODO: ajouter un endpoint au niveau de l'api pour recupérer le dernier status
const lastAccounts = computed(() => {
  return props.organisme?.files?.filter((file) => file.typeFile === eTypeFile.Comptes)[0]
})
</script>

<template>
  <div class="py-6 px-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
    <div class="flex flex-col gap-8">
      <FicheIdentity
        :organisme="organisme"
        :is-foundation="isFoundation"
      />

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

      <div>
        <div class="px-4 sm:px-0">
          <h3 class="text-base/7 font-semibold text-gray-900 mb-0 fr-background-alt--grey fr-py-3v fr-px-2w">
            Compte
          </h3>
        </div>
        <div class="mt-6 border-t border-gray-100">
          <dl class="divide-y p-0">
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">
                Dépôts des comptes
              </dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                <DsfrBadge
                  no-icon
                  small
                  :label="stateOfFilingOfAccounts.label"
                  :type="stateOfFilingOfAccounts.type"
                />
              </dd>
            </div>
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">
                Date de clôture de l'exercice comptable (jour/mois)
              </dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ fiscalEndDateAt }}
              </dd>
            </div>

            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">
                Dernier comptes déposés le
              </dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ lastAccounts?.uploadedAt ? dateToStringFr(lastAccounts.uploadedAt) : 'Non renseigné' }}
              </dd>
            </div>
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">
                Dernier comptes déposés:
              </dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                <DsfrFileDownload
                  v-if="lastAccounts"
                  :title="lastAccounts.name"
                  :format="getFileFormat(lastAccounts.mimeType)"
                  :size="formatBytes(lastAccounts.byteSize)"
                  :detail="getFileDetail(lastAccounts)"
                  href="#"
                  :download="lastAccounts.originalName"
                  class="fr-mt-2v"
                />
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-8">
      <div>
        <div class="px-4 sm:px-0">
          <h3 class="text-base/7 font-semibold text-gray-900 mb-0 fr-background-alt--grey fr-py-3v fr-px-2w">
            Contact
          </h3>
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
              <dt class="text-sm/6 font-medium text-gray-900">
                Adresse du siège
              </dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ organisme.address.oneLine }}
              </dd>
            </div>
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">
                Email
              </dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ organisme.email }}
              </dd>
            </div>
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">
                Téléphone
              </dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ organisme.phone }}
              </dd>
            </div>
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">
                Site web
              </dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ organisme.website }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div v-if="!isFoundation">
        <div class="px-4 sm:px-0">
          <h3 class="text-base/7 font-semibold text-gray-900 mb-0 fr-background-alt--grey fr-py-3v fr-px-2w">
            Agrément
          </h3>
        </div>
        <div class="mt-6 border-t border-gray-100">
          <dl class="divide-y p-0">
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">
                Type
              </dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ asAssociation?.quality?.type }}
              </dd>
            </div>
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">
                Date de début
              </dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
                {{ dateToStringFr(asAssociation?.quality?.startedAt) }}
              </dd>
            </div>
            <div class="py-2 sm:grid sm:grid-cols-5">
              <dt class="text-sm/6 font-medium text-gray-900">
                Date de fin
              </dt>
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
