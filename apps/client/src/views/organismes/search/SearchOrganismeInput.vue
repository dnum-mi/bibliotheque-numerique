<script setup lang="ts">
import { eOrganismeTypeToSearch, organismeTypeToSeachArray } from '@biblio-num/shared'
import type { IBasicOrganisme, OrganismeTypeToSearchKey } from '@biblio-num/shared'
import SubLayoutSearch from './SubLayoutSearch.vue'
import apiClient from '@/api/api-client'
import useToaster from '@/composables/use-toaster'

const toaster = useToaster()

const resetFullTextAndRecents = () => {
  inputSearch.value = ''
  inputSize.value = 5
  typeOrganisme.value = [eOrganismeTypeToSearch.associations, eOrganismeTypeToSearch.fondations]
  hasError.value = false
  hasSearched.value = false
}

const inputSearch = ref('')
const inputSize = ref<number>(5)
const handleInputChange = (value: string) => {
  inputSearch.value = value.trim()
}

const isLoading = ref<boolean>(false)
const hasError = ref<boolean>(false)
const results = ref<IBasicOrganisme[]>([])
const hasSearched = ref<boolean>(false)
// #region Gestion des types d'organisme
const typeOrganismeOptions = [
  {
    label: 'Associations',
    id: eOrganismeTypeToSearch.associations,
    value: eOrganismeTypeToSearch.associations,
    hint: `Recherche uniquement les ${eOrganismeTypeToSearch.associations}`,
    name: eOrganismeTypeToSearch.associations,
  },
  {
    label: 'Fondations',
    id: eOrganismeTypeToSearch.fondations,
    value: eOrganismeTypeToSearch.fondations,
    hint: `Rechercher uniquement les ${eOrganismeTypeToSearch.fondations}`,
    name: eOrganismeTypeToSearch.fondations,
  },
]

const typeOrganisme = ref<OrganismeTypeToSearchKey[]>([eOrganismeTypeToSearch.associations, eOrganismeTypeToSearch.fondations])
const errTypeOrganisme = ref<string>('')
const handleTypeOrganisme = (value: OrganismeTypeToSearchKey[]) => {
  if (!value.length) {
    typeOrganisme.value = [...typeOrganisme.value]
    errTypeOrganisme.value = 'Un type d\'organisme est requis'
    return
  }
  typeOrganisme.value = value
  errTypeOrganisme.value = ''
}
// #endregion Gestion des types d'organisme

const onChangeNbResulst = (playload: number) => {
  if (playload < 1) {
    inputSize.value = 1
  }
  onSearchFullText()
}
// # region Search organismes
const onSearchFullText = async () => {
  let entityType

  if (typeOrganisme.value.length === 1) {
    entityType = typeOrganisme.value[0]
  } else if (typeOrganisme.value.length === 2 && typeOrganisme.value.every(t => organismeTypeToSeachArray.includes(t))) {
    entityType = eOrganismeTypeToSearch.all
  }

  const query = {
    sentence: inputSearch.value,
    entityType,
    size: Number(inputSize.value),
  }
  if (!query) {
    return
  }

  isLoading.value = true
  hasError.value = false
  results.value = []

  try {
    const response = await apiClient.searchOrganisme(query)
    results.value = response
    hasSearched.value = true
    hasError.value = !response.length
  } catch {
    results.value = []
    hasSearched.value = false
    hasError.value = true
    toaster.addErrorMessage('La recherche est momentanément indisponible. Veuillez réessayer plus tard.')
  } finally {
    isLoading.value = false
  }
}
// #endregion Search organismes
</script>

<template>
  <SubLayoutSearch :is-loading="isLoading" :has-error="hasError" :results="results" :has-searched="hasSearched">
    <template #section-search>
      <p class="fr-text--sm fr-mb-2w text-grey-700">
        Rechercher un titre, une description, un bénéficiaire effectif ou une adresse à travers cette recherche plein texte.
      </p>

      <form @submit.prevent="onSearchFullText">
        <DsfrCheckboxSet
          :model-value="typeOrganisme"
          legend="Type d'organisme recherché:"
          name="TypeOrganisme"
          :options="typeOrganismeOptions"
          small
          inline
          required
          aria-required
          :error-message="errTypeOrganisme"
          @update:model-value="handleTypeOrganisme"
        />
        <DsfrSearchBar
          v-model="inputSearch"
          label="Rechercher un numéro, un titre, une description..."
          :disabled="isLoading"
          @update:model-value="handleInputChange"
          @search="onSearchFullText"
        />
      </form>
    </template>
    <template #section-error>
      <div
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
          Nous n'avons trouvé aucun organisme correspondant à cette recherche.
        </p>

        <DsfrButton
          label="Effacer la recherche"
          tertiary
          no-outline
          icon="fr-icon-close-circle-line"
          @click="resetFullTextAndRecents"
        />
      </div>
    </template>
    <template v-if="hasSearched" #section-before-table>
      <div class="flex flex-row gap-2 items-center fr-mb-4w ">
        <DsfrInput
          v-model="inputSize"
          label-class="whitespace-nowrap"
          wrapper-class="min-w-[4em] w-10%"
          type="number"
          label="Nombre d'organismes attendus par type :"
          label-visible
          :placeholder="5"
          @update:model-value="onChangeNbResulst"
        />
      </div>
    </template>
  </SubLayoutSearch>
</template>
