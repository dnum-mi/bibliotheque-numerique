<script setup lang="ts">
import { baseApiUrl } from '@/api/api-client'
import { getFileRoute } from '@/api/bn-api-routes'
import type { FileToDownload } from '@/components/DownloadFile.vue'
import { dateToStringFr } from '@/utils'
import { eState, eTypeFile } from '@biblio-num/shared'
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
  const file = props.organisme?.files?.filter((file) => file.typeFile === eTypeFile.Comptes)[0]
  if (!file) {
    return null
  }
  return {
    ...file,
    url: `${baseApiUrl}${getFileRoute(file?.id)}`,
    filename: file.name,
    byteSizeBigInt: file.byteSize,
    state: eState.uploaded,
  }
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
        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Dépôts des comptes
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            <DsfrBadge
              no-icon
              small
              :label="stateOfFilingOfAccounts.label"
              :type="stateOfFilingOfAccounts.type"
            />
          </dd>
        </div>

        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Date de clôture de l'exercice comptable (jour/mois)
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            {{ fiscalEndDateAt }}
          </dd>
        </div>
        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Années des dépots des comptes:
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            {{ organisme?.accountDepositYears ? organisme?.accountDepositYears?.join(' - ') || 'Aucun' : 'Non renseigné' }}
          </dd>
        </div>

        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Dernier compte déposé:
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            <DownloadFile
              v-if="lastAccounts"
              :file="lastAccounts as FileToDownload"
            />
            <span>
              {{ lastAccounts?.uploadedAt ? dateToStringFr(lastAccounts.uploadedAt) : 'Non renseigné' }}
            </span>
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
