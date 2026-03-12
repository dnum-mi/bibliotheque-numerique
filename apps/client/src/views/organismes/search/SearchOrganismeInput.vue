<script setup lang="ts">
import { eOrganismeTypeToSearch } from '@biblio-num/shared'
import type { ISearchHubInput, OrganismeTypeToSearchKey } from '@biblio-num/shared'

defineProps({
  isLoading: {
    type: Boolean,
    required: true,
  },
})
const emit = defineEmits<{
  'search': [searchInput: ISearchHubInput]
}>()

const reset = () => {
  inputSearch.value = ''
  inputSize.value = 5
  typeOrganisme.value = eOrganismeTypeToSearch.all
}

defineExpose({
  reset,
})

const typeOrganismeOptions = [
  {
    label: 'Tout',
    id: eOrganismeTypeToSearch.all,
    value: eOrganismeTypeToSearch.all,
    hint: 'Rechercher dans toutes les organismes',
  },
  {
    label: 'Associations',
    id: eOrganismeTypeToSearch.associations,
    value: eOrganismeTypeToSearch.associations,
    hint: `Recherche uniquement les ${eOrganismeTypeToSearch.associations}`,
  },
  {
    label: 'Fondations',
    id: eOrganismeTypeToSearch.fondations,
    value: eOrganismeTypeToSearch.fondations,
    hint: `Rechercher uniquement les ${eOrganismeTypeToSearch.fondations}`,
  },
]
const typeOrganisme = ref<OrganismeTypeToSearchKey>(eOrganismeTypeToSearch.all)
const inputSearch = ref('')
const inputSize = ref<number>(5)
const handleInputChange = (value: string) => {
  inputSearch.value = value.trim()
}
const onSearchFullText = () => {
  emit('search', {
    sentence: inputSearch.value,
    entityType: typeOrganisme.value,
    size: Number(inputSize.value),
  })
}
</script>

<template>
  <p class="fr-text--sm fr-mb-2w text-grey-700">
    Rechercher un titre, une description, un bénéficiaire effectif ou une adresse à travers cette recherche plein texte.
  </p>

  <form @submit.prevent="onSearchFullText">
    <DsfrRadioButtonSet
      v-model="typeOrganisme"
      legend="Type d'organisme recherché:"
      name="TypeOrganisme"
      :options="typeOrganismeOptions"
      small
      inline
    />

    <div class="flex flex-row gap-2 items-center fr-mb-4w ">
      <DsfrInput
        v-model="inputSize"
        label-class="whitespace-nowrap"
        wrapper-class="min-w-[4em] w-10%"
        type="number"
        label="Nombre de résultats:"
        label-visible
        :placeholder="5"
      />
    </div>

    <DsfrSearchBar
      v-model="inputSearch"
      label="Rechercher un numéro, un titre, une description..."
      :disabled="isLoading"
      @update:model-value="handleInputChange"
      @search="onSearchFullText"
    />
  </form>
</template>
