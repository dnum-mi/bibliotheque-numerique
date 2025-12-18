<script setup lang="ts">
import { dateToStringFr } from '@/utils'
import type { organismeCategoryKey, IFile } from '@biblio-num/shared'
import { eTypeFile } from '@biblio-num/shared'
import type { DsfrBadgeProps } from '@gouvminint/vue-dsfr'

export type tInfoCompte = {
  files: IFile[]
  fiscalEndAt: Date | null
  creationAt: Date
  accountDepositYears: number[]
}

const props = defineProps<{
  compte: tInfoCompte,
  organismeId: string,
  organismeType: organismeCategoryKey
}>()

const fiscalEndDateAt = computed(() => {
  return props?.compte.fiscalEndAt
    ? new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
      }).format(new Date(props.compte.fiscalEndAt))
    : 'Non renseigné'
})

const lastAccountFile = computed(() => {
  const file = props.compte?.files
    ?.filter((f) => f.typeFile === eTypeFile.Comptes)
    .sort((a, b) => {
      const aDate = new Date(a.uploadedAt || a.effectiveAt || a.createdAt)
      const bDate = new Date(b.uploadedAt || b.effectiveAt || b.createdAt)
      return bDate.getTime() - aDate.getTime()
    })[0]
  if (!file) {
    return null
  }
  return file
})

const stateOfFilingOfAccounts = computed<{
  label: string
  type: DsfrBadgeProps['type']
}>(() => {
  const ok = { label: 'OK', type: 'info' as const }
  const ko = { label: 'HORS DÉLAI', type: 'error' as const }

  const fiscalEndAt = props.compte.fiscalEndAt ? new Date(props.compte.fiscalEndAt) : null

  if (!fiscalEndAt) {
    return ok
  }

  const now = new Date()

  // 1) Dernière clôture fiscale passée (même mois/jour que fiscalEndAt)
  const fiscalMonth = fiscalEndAt.getMonth()
  const fiscalDay = fiscalEndAt.getDate()

  let lastFiscalEndPassed = new Date(now.getFullYear(), fiscalMonth, fiscalDay)
  // si la clôture de cette année n'est pas encore passée, on prend celle de l'an dernier
  if (lastFiscalEndPassed.getTime() > now.getTime()) {
    lastFiscalEndPassed = new Date(now.getFullYear() - 1, fiscalMonth, fiscalDay)
  }

  // 2) cutoff = dernière clôture passée - 1 an
  const cutoff = new Date(lastFiscalEndPassed)
  cutoff.setFullYear(cutoff.getFullYear() - 1)

  // 3)
  const lastDepositDate = lastAccountFile.value?.uploadedAt

  // 4) Cas "fondation trop récente" : on ne pénalise pas si créée après le cutoff
  const createdAt = props.compte.creationAt ? new Date(props.compte.creationAt) : null
  if (!lastDepositDate) {
    if (createdAt && createdAt.getTime() >= cutoff.getTime()) {
      return ok
    }
    return ko
  }

  // 5) Décision
  return new Date(lastDepositDate).getTime() >= cutoff.getTime() ? ok : ko
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
            {{ compte.accountDepositYears?.length ? compte.accountDepositYears.join(', ') : 'Aucune' }}
          </dd>
        </div>

        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Dernier compte déposé:
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            <DownloadHubFile
              v-if="lastAccountFile"
              :file="lastAccountFile"
              :organisme-type
              :organisme-id
            />
            <span>
              {{ lastAccountFile?.uploadedAt ? dateToStringFr(lastAccountFile.uploadedAt) : 'Non renseigné' }}
            </span>
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
