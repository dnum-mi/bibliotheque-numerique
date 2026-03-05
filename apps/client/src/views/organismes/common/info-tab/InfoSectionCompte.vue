<script setup lang="ts">
import type { organismeCategoryKey, IFile } from '@biblio-num/shared'
import { eTypeFile } from '@biblio-num/shared'
import InfoRow from '@/views/organismes/components/InfoRow.vue'
import { dateToStringFr } from '@/utils'

export type tInfoCompte = {
  files: IFile[]
  dueDate: Date | null
  creationAt: Date
  fiscalEndDateAt: Date | null
  accountDepositYears: number[]
  publicGenerosityYears: number[],
  publicSubsidyYears: number[],
  foreignFinancingYears: number[]
}

const props = defineProps<{
  compte: tInfoCompte,
  organismeId: string,
  organismeType: organismeCategoryKey
}>()

const accountFiles = computed(() => {
  const file = props.compte?.files
    ?.filter((f) => f.typeFile === eTypeFile.Comptes)
    .sort((a, b) => {
      const aDate = new Date(a.uploadedAt || a.effectiveAt || a.createdAt)
      const bDate = new Date(b.uploadedAt || b.effectiveAt || b.createdAt)
      return bDate.getTime() - aDate.getTime()
    })
  if (!file?.length) {
    return []
  }
  return file
})

const fiscalEndDate = computed(() => {
  return props.compte.fiscalEndDateAt
    ? new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
      }).format(new Date(props.compte.fiscalEndDateAt))
    : '-'
})

const dueDate = computed(() => {
  return props.compte.dueDate
    ? dateToStringFr(props.compte.dueDate)
    : 'Illimitée'
})
</script>

<template>
  <section>
    <h2 class="fr-h4">
      Vie économique
    </h2>
    <div class="fr-background-alt--grey fr-p-2w">
      <InfoRow label="Date du terme">
        {{ dueDate }}
      </InfoRow>
      <InfoRow label="Dépôts des comptes">
        {{ compte.accountDepositYears?.join(' - ') || "-" }}
      </InfoRow>
      <InfoRow label="Date de clôture de l'exercice comptable (jour/mois)">
        {{ fiscalEndDate }}
      </InfoRow>
      <InfoRow label="Appel à la générosité publique">
        {{ compte.publicGenerosityYears?.join(', ') || "-" }}
      </InfoRow>
      <InfoRow label="Financements étrangers">
        {{ compte.foreignFinancingYears?.join(', ') || "-" }}
      </InfoRow>
      <InfoRow label="Subventions publiques">
        {{ compte.publicSubsidyYears?.join(', ') || "-" }}
      </InfoRow>
      <InfoRow label="Pièces disponibles">
        <ul v-if="accountFiles.length" class="fr-p-0 list-none">
          <li v-for="file in accountFiles" :key="file.id" class="fr-mb-1w">
            <DownloadHubFile
              :file="file"
              :organisme-id="organismeId"
              :organisme-type="organismeType"
              hide-size
            />
          </li>
        </ul>
        <span v-else>-</span>
      </InfoRow>
    </div>
  </section>
</template>

<style scoped>
.separator {
  color: var(--border-plain-grey);
  font-weight: 300;
  margin: 0 0.5rem;
}
</style>
