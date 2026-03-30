<script setup lang="ts">
import apiClient from '@/api/api-client'
import { routeNames } from '@/router/route-names'
import type { HeaderDataTable } from '@/shared/types/DataTable.type'
import { organismeStatusArray, organismeTypes } from '@biblio-num/shared'
import type { IBasicOrganisme, ILastConsultedOrganisme } from '@biblio-num/shared'
import OrganismeBadgesRenderer from '@/components/Badges/organisme/OrganismeBadgesRenderer.vue'
import type { RowDataType } from '@/components/datatable/client-side/DataTableClientSide.vue'
import OrganismeStatusBadgeRenderer from '@/components/Badges/organisme/OrganismeStatusBadgeRenderer.vue'

type ISourceListType = (IBasicOrganisme | ILastConsultedOrganisme) & RowDataType & { postalCodeCity?: string }

const props = defineProps({
  hasError: {
    type: Boolean,
    required: true,
  },
  hasSearched: {
    type: Boolean,
    required: false,
    default: false,
  },
  results: {
    type: Array<IBasicOrganisme>,
    default: [],
  },
})

const isLoading = defineModel<boolean>()

const router = useRouter()

const header: HeaderDataTable[] = [
  {
    field: 'id',
    text: 'Numéro RNA / RNF',
  },
  {
    field: 'type',
    text: 'Type',
    renderer: markRaw(OrganismeBadgesRenderer),
    filter: 'agSetColumnFilter',
    filterParams: {
      values: [...organismeTypes],
      cellRenderer: OrganismeBadgesRenderer,
      targetFilterType: 'strings',
    },
  },
  {
    field: 'title',
    text: 'Titre',
  },
  {
    field: 'state',
    text: 'État',
    renderer: markRaw(OrganismeStatusBadgeRenderer),
    filter: 'agSetColumnFilter',
    filterParams: {
      values: [...organismeStatusArray],
      cellRenderer: OrganismeStatusBadgeRenderer,
      targetFilterType: 'strings',
    },
  },
  {
    field: 'postalCodeCity',
    text: 'Code postal - Ville',
  },
]

const recentResults = ref<ILastConsultedOrganisme[]>([])
const titleTable = computed(() => props.hasSearched ? 'Résultats de la recherche' : 'Derniers organismes consultés')
const rows = computed<ISourceListType[]>(() => {
  const baseData = (props.hasSearched ? props.results : recentResults.value) as ISourceListType[]

  return baseData.map((row) => ({
    ...row,
    cursor: 'pointer',
    postalCodeCity: `${row.postalCode} - ${row.city}`,
  }))
})

const rowClick = async (data: unknown) => {
  isLoading.value = true
  const d = data as ISourceListType

  await router.push({
    name: routeNames.FICHE_ORGANISME,
    params: { id: d.id },
  })
  isLoading.value = false
}

//#region 📍------ Récents ------ 📍
const loadRecent = async () => {
  try {
    recentResults.value = await apiClient.getLastConsultedOrganisme()
  } catch {
    recentResults.value = []
  }
}

onMounted(async () => {
  await loadRecent()
})
</script>

<template>
  <section
    class="bn-id-section"
  >
    <slot name="section-search" />
  </section>

  <!-- Séparateur -->
  <hr
    v-if="!hasError"
    class="fr-mt-2w"
  >

  <section>
    <template v-if="hasError">
      <slot name="section-error" />
    </template>

    <!-- Loading général (plein texte ou navigation) -->
    <template v-else-if="isLoading">
      <div
        class="fr-my-4w py-8 text-center"
        role="status"
        aria-live="polite"
      >
        <VIcon
          scale="3"
          name="ri-refresh-line"
          animation="spin"
          aria-hidden="true"
        />
        <p class="text-center fr-text--md fr-mt-2w text-grey-500">
          Recherche en cours...
        </p>
      </div>
    </template>
    <template v-else>
      <div v-if="rows.length" class="bn-table-wrap">
        <slot name="section-before-table" />
        <DataTableClientSide
          :title="titleTable"
          :rows-data="rows"
          :headers="header"
          @row-click="rowClick"
        />
      </div>
    </template>
  </section>
</template>

<style lang="css" scoped>
.bn-id-section {
  border-radius: 0.5rem;
  border: 1px solid var(--border-default-grey);
  padding: 1.5rem;
  background-color: var(--background-alt-grey);
}
</style>
