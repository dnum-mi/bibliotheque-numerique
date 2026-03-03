<script setup lang="ts">
import type {
  organismeCategoryKey,
  OrganismeStatusKey,
  OrganismeTypeKey,
} from '@biblio-num/shared'
import { dateToStringFr } from '@/utils'
import OrganismeStatusBadge from '@/components/Badges/organisme/OrganismeStatusBadge.vue'
import { downloadFicheOrganisme } from '@/utils/downloadFile'

export type tInfoSidebar = {
  id: string
  organismeType: organismeCategoryKey,
  state: OrganismeStatusKey,
  stateEffectiveAt: Date | null,
  creationAt: Date,
  typeOrg: OrganismeTypeKey | string,
  prefecture: string,
  isPersonDataPrivate: boolean | null,
}

const props = defineProps<{
  sidebar: tInfoSidebar,
}>()

const isDownloading = ref(false)

const onDownload = async () => {
  if (isDownloading.value) {
    return
  }

  try {
    isDownloading.value = true
    await downloadFicheOrganisme({
      organismeType: props.sidebar.organismeType || 'association',
      organismeId: props.sidebar.id || '',
    })
  } catch (error) {
    console.error('Erreur lors du téléchargement :', error)
  } finally {
    isDownloading.value = false
  }
}

const labelSensitivData = computed(() => {
  if (!props.sidebar.isPersonDataPrivate) {
    return ''
  }
  return `Cette fiche contient des données personnelles sensibles.`
})
</script>

<template>
  <div class="flex flex-col justify-center items-start gap-5">
    <div>
      <p class="fr-text--xs fr-text--bold fr-mb-1v uppercase">
        Type de structure
      </p>
      <OrganismeBadge :type="sidebar.typeOrg" big />
    </div>

    <div>
      <p class="fr-text--xs fr-text--bold fr-mb-1v uppercase">
        État de la structure
      </p>
      <OrganismeStatusBadge :status="sidebar.state" big />
    </div>

    <div>
      <p class="fr-text--xs fr-text--bold fr-mb-1v uppercase">
        Date de création
      </p>
      <p class="fr-text--sm fr-mb-0">
        {{ dateToStringFr(sidebar.creationAt) }}
      </p>
    </div>

    <div>
      <p class="fr-text--xs fr-text--bold fr-mb-1v uppercase">
        Préfecture
      </p>
      <p class="fr-text--sm fr-mb-0">
        {{ sidebar.prefecture || '-' }}
      </p>
    </div>

    <DsfrButton
      :icon="isDownloading ? { name: 'ri-refresh-line', animation: 'spin' } : ''"
      :label="isDownloading ? 'Téléchargement...' : 'Télécharger la fiche'"
      class="fr-mb-2w"
      size="small"
      :disabled="isDownloading"
      @click="onDownload"
    />
    <p
      v-if="sidebar.isPersonDataPrivate"
      class="fr-text--xs fr-text--bold fr-mb-1v uppercase bn-text--color-warning"
    >
      {{ labelSensitivData }}
    </p>
  </div>
</template>
