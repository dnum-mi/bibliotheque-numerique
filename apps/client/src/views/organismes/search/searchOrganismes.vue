<script lang="ts" setup>
import { EEntityTypeSearchOrganisme, eOrganismeType } from '@biblio-num/shared'
import type { IFoundationOutput, ISiafSearchOrganismeResponseOutput } from '@biblio-num/shared'
import apiClient from '../../../api/api-client'
import { routeNames } from '../../../router/route-names'
import { EOrganismeIdType } from '../../../stores'
import { extractAddressInfo } from './utils'
import useToaster from '@/composables/use-toaster'

const router = useRouter()
const toaster = useToaster()

const inputSearch = ref('')
const results = ref<ISiafSearchOrganismeResponseOutput[] | undefined>(undefined)

const isLoading = ref(false)
const isRedirecting = ref(false)
const hasSearched = ref(false)

const headers = ['Numéro RNA / RNF', 'Titre', 'Type', 'Ville', 'Code postal', 'Action']

const navigateToDetails = async (id: string, entityType: string) => {
  const isFondation = entityType === EEntityTypeSearchOrganisme.Fondation
  const idType = isFondation ? EOrganismeIdType.Rnf : EOrganismeIdType.Rna

  try {
    if (idType === EOrganismeIdType.Rnf) {
      await apiClient.addOneRnf(id)
    } else {
      await apiClient.addOneRna(id)
    }

    await router.push({
      name: routeNames.FICHE_ORGANISME,
      params: { id },
      query: { idType },
    })
  } catch {
    isRedirecting.value = false
    isLoading.value = false
    toaster.addErrorMessage('Impossible d\'accéder à la fiche de cet organisme pour le moment.')
  }
}

const onSearch = async () => {
  const query = inputSearch.value.trim()
  if (!query) {
    return
  }

  isLoading.value = true
  isRedirecting.value = false
  results.value = []

  try {
    const response = await apiClient.searchOrganisme(inputSearch.value)

    const exactMatch = response.find((item) => item.entity.id.toLowerCase() === query.toLowerCase())

    if (exactMatch) {
      isLoading.value = false
      isRedirecting.value = true
      await navigateToDetails(exactMatch.entity.id, exactMatch.entity_type)
      return
    }

    results.value = response
    hasSearched.value = true
  } catch {
    results.value = []
    hasSearched.value = false
    toaster.addErrorMessage('La recherche est momentanément indisponible. Veuillez réessayer plus tard.')
  } finally {
    if (!isRedirecting.value) {
      isLoading.value = false
    }
  }
}

const resetSearch = () => {
  inputSearch.value = ''
  results.value = []
  hasSearched.value = false
  isLoading.value = false
  isRedirecting.value = false
}

const rows = computed(() => {
  if (!results.value?.length) {
    return []
  }

  return results.value.map((result) => {
    const isFondation = result.entity_type === EEntityTypeSearchOrganisme.Fondation

    const subType = isFondation ? (result.entity as IFoundationOutput).foundationType || eOrganismeType.unknown : eOrganismeType.ASSO

    const { ville, codePostal } = extractAddressInfo(result.entity)

    return {
      rowData: [
        result.entity.id,
        result.entity.title,
        {
          component: 'OrganismeBadge',
          type: subType,
        },
        ville,
        codePostal,
        {
          component: 'DsfrButton',
          label: 'Voir',
          icon: 'fr-icon-eye-line',
          onClick: () => navigateToDetails(result.entity.id, result.entity_type),
        },
      ],
    }
  })
})

const handleInputChange = (value: string | number | undefined) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    resetSearch()
  }
}
</script>

<template>
  <LayoutList
    title="Rechercher dans le référentiel des associations et des fondations "
    title-bg-color="var(--border-plain-grey)"
    title-icon="fr-icon-search-line"
  >
    <div
      v-if="isRedirecting"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm transition-all"
    >
      <div class="fr-icon-success-line fr-icon--lg text-green-600 mb-2" />
      <h3 class="fr-h4 mb-1">
        Organisme trouvé !
      </h3>
      <p class="text-grey-600 flex items-center gap-2">
        <VIcon
          name="ri-refresh-line"
          animation="spin"
        />
        Redirection vers la fiche organisme...
      </p>
    </div>

    <div class="p-8">
      <form @submit.prevent="onSearch">
        <DsfrSearchBar
          v-model="inputSearch"
          label="Recherche un numéro, un titre, une description ..."
          :disabled="isLoading"
          @update:model-value="handleInputChange"
          @search="onSearch"
        />
      </form>

      <div
        v-if="isLoading"
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

      <DsfrTable
        v-else-if="results?.length"
        class="w-full"
        title="Résultats de la recherche"
        :headers="headers"
        :rows="rows"
      />

      <div
        v-else-if="hasSearched"
        class="fr-mt-4w flex flex-col items-center text-center py-8"
        role="status"
        aria-live="polite"
      >
        <div class="mb-4 p-4 bg-white rounded-full">
          <span
            class="fr-icon-search-line fr-icon--xl"
            aria-hidden="true"
          />
        </div>

        <h3 class="fr-h5 fr-mb-1w">
          Aucun résultat trouvé
        </h3>
        <p class="text-grey-600 fr-mb-2w max-w-md">
          Nous n'avons trouvé aucun organisme correspondant.
        </p>

        <DsfrButton
          label="Effacer la recherche"
          tertiary
          no-outline
          icon="fr-icon-close-circle-line"
          @click="resetSearch"
        />
      </div>
    </div>
  </LayoutList>
</template>
