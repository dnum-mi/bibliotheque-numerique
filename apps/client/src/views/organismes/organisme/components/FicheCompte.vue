<script setup lang="ts">
import { dateToStringFr } from '@/utils'
import { formatBytes, getFileDetail, getFileFormat } from '@/utils/file.utils'
import { eTypeFile } from '@biblio-num/shared'
import type { IAssociationOutput, IFoundationOutput } from '@biblio-num/shared'
import type { DsfrBadgeProps } from '@gouvminint/vue-dsfr'

const props = withDefaults(
  defineProps<{
    organisme: IAssociationOutput | IFoundationOutput
    missingDeclarationYears?: number[]
  }>(),
  {},
)

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
</template>
