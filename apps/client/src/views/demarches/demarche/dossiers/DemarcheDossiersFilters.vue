<script lang="ts" setup>
import { computed, type Ref, ref, watchEffect } from 'vue'
import { useStorage } from '@vueuse/core'
import { useUserStore } from '@/stores'
import { SearchDossierDto } from '@biblio-num/shared'

const userStore = useUserStore()

const props = defineProps<{}>()

const events = defineEmits({
  'filter-selected': (search: SearchDossierDto) => true,
})

const filterLabelGroups = {
  create: {
    title: 'Enregistrement du tableau actuel',
    button: 'Enregistrer',
    input: 'Nommer le tableau actuel',
    icon: 'ri-save-line',
    submitFn (filters) {
      userFilters.value = { ...userFilters.value, [currentFilterName.value]: filters }
      userFilter.value = currentFilterName.value
    },
  },
  update: {
    title: 'Modification du tableau actuel',
    button: 'Enregistrer',
    input: 'Renommer le tableau actuel',
    icon: 'ri-edit-line',
    submitFn () {
      userFilters.value = Object.fromEntries(
        Object.entries(userFilters.value).map(([key, value]) => [key === userFilter.value ? currentFilterName.value : key, value]),
      )
      userFilter.value = currentFilterName.value
    },
  },
  delete: {
    title: 'Supprimer le filtre actuel',
    button: 'Supprimer',
    input: 'Supprimer le filtre actuel',
    icon: 'ri-delete-bin-line',
    submitFn () {
      userFilters.value = Object.fromEntries(Object.entries(userFilters.value).filter(([key]) => key !== userFilter.value))
      userFilter.value = undefined
    },
  },
} as const
type FilterModalType = keyof typeof filterLabelGroups;
const modalOrigin = ref()
const userFilter = ref()
const currentFilterName = ref()
const filterModalType: Ref<FilterModalType> = ref('create')
const filterModalOpen = ref(false)
const closeFilterModal = () => {
  filterModalOpen.value = false
}
const userFilters = useStorage('dossiers-filters', {})
const bnDemarchesGrid = ref()

const filterLabelGroup = computed(() => filterLabelGroups[filterModalType.value])

const openFilterModal = (modalType) => {
  filterModalOpen.value = true
  filterModalType.value = modalType
  currentFilterName.value = modalType === 'create' ? '' : userFilter.value
}

const saveCurrentFilter = () => {
  const filters = bnDemarchesGrid.value.getCurrentFilter()
  filterLabelGroup.value.submitFn(filters)
  filterModalOpen.value = false
}

const resetAgGridFilters = () => {
  bnDemarchesGrid.value.resetAgGridFilters()
  userFilter.value = undefined
}

watchEffect(() => {
  bnDemarchesGrid.value?.setFilters(userFilters.value[userFilter.value])
})
/* endregion */
</script>

<template>
  <div class="flex justify-end h-24">
    <DsfrSelect
      v-if="Object.keys(userFilters).length"
      v-model="userFilter"
      label="Filtres personnalisés"
      default-unselected-text="Sélectionner un filtre"
      :options="Object.entries(userFilters).map(([value]) => ({ value, text: value }))"
    />

    <div class="fr-mx-2v fr-mt-2v flex justify-center items-center gap-2">
      <DsfrButton
        ref="modalOrigin"
        :disabled="!userFilter"
        type="submit"
        @click="resetAgGridFilters()"
      >
        <VIcon name="ri-filter-off-line" />
      </DsfrButton>
      <DsfrButton
        ref="modalOrigin"
        :disabled="!userFilter"
        type="submit"
        @click="openFilterModal('update')"
      >
        <VIcon name="ri-edit-line" />
      </DsfrButton>
      <DsfrButton
        ref="modalOrigin"
        :disabled="!userFilter"
        type="submit"
        @click="openFilterModal('delete')"
      >
        <VIcon name="ri-delete-bin-line" />
      </DsfrButton>
    </div>
    <div class="fr-mx-2v fr-mt-2v flex justify-center items-center">
      <DsfrButton
        ref="modalOrigin"
        type="submit"
        @click="openFilterModal('create')"
      >
        Enregistrer le tableau actuel
        <VIcon name="ri-save-line" />
      </DsfrButton>
    </div>
  </div>
  <DsfrModal
    :opened="filterModalOpen"
    :title="filterLabelGroup.title"
    :origin="$refs.modalOrigin"
    @close="closeFilterModal"
  >
    <form
      class="flex items-end gap-4"
      @submit.prevent="saveCurrentFilter()"
    >
      <div class="flex-basis-[34%] flex-grow">
        <DsfrInput
          v-model="currentFilterName"
          type="text"
          :label="filterLabelGroup.input"
          label-visible
          placeholder="> 15 300€"
          :readonly="filterModalType === 'delete'"
        />
      </div>
      <div class="flex items-end">
        <DsfrButton
          type="submit"
          :label="filterLabelGroup.button"
          :icon="{ name: filterLabelGroup.icon }"
          icon-right
          :disabled="!currentFilterName"
        />
      </div>
    </form>
  </DsfrModal>
</template>

<style scoped></style>
