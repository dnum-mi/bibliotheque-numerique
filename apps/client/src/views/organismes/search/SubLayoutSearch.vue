<script setup lang="ts">
import apiClient from '@/api/api-client'
import { routeNames } from '@/router/route-names'
import type { IBasicOrganisme, ILastConsultedOrganisme } from '@biblio-num/shared'

const props = defineProps({
  // isLoading: {
  //   type: Boolean,
  //   required: true,
  // },
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

// DsfrTable is ($*&#% and won't take all of width. So we force title to be "too big" with spaces, so that the table take entire available width.
const LOTS_OF_SPACE = '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'

//#region 📍------ État général ------ 📍
const headers = [
  'Numéro RNA / RNF',
  'Type',
  'Titre',
  'État',
  'Code postal - Ville',
]

const recentResults = ref<ILastConsultedOrganisme[]>([])
// const results = ref<IBasicOrganisme[]>([])
const titleTable = computed(() => props.hasSearched ? 'Résultats de la recherche' : 'Derniers organismes consultés')
const sourceList = computed(() => (props.hasSearched ? props.results : recentResults.value))
const rows = computed(() => {
  if (!sourceList.value?.length) {
    return []
  }

  return sourceList.value.map((result: IBasicOrganisme) => {
    return {
      rowAttrs: {
        class: 'bn-search-row',
        onClick: () => navigateToDetails(result.id),
      },
      // on laisse le DSFR gérer le rendu, mais la ligne entière sera cliquable côté template
      rowData: [
        result.id,
        {
          component: 'OrganismeBadge',
          type: result.type,
        },
        result.title + LOTS_OF_SPACE,
        result.state,
        `${result.postalCode} - ${result.city}`,
      ],
    }
  })
})

const navigateToDetails = async (id: string) => {
  isLoading.value = true

  await router.push({
    name: routeNames.FICHE_ORGANISME,
    params: { id },
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
        <DsfrTable
          :title="titleTable"
          :headers="headers"
          :rows="rows"
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
