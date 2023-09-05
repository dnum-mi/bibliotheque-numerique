<script lang="ts" setup>
import { computed, type Ref, type ComputedRef, ref, onMounted } from 'vue'

export type SmallFilter = {
  id: number
  name: string
};

const props = withDefaults(defineProps<{
  filters: SmallFilter[],
  selectedFilter: SmallFilter | null,
  paginationChanged: boolean
}>(), {
  filters: () => [],
  selectedFilter: null,
})

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (event: 'selectFilter', filterId: number | null) : void
  (event: 'createFilter', filterName: string) : void
  (event: 'updateFilterName', filterName: string) : void
  (event: 'updateFilter') : void
  (event: 'deleteFilter') : void
}>()

const filterLabelGroups = {
  create: {
    title: 'Créer un nouveau filtre personnalisé',
    button: 'Enregistrer',
    input: 'Nommer le filtre personnalisé',
    icon: 'ri-save-line',
    submitFn () {
      emit('createFilter', inputFilterName.value)
    },
  },
  update: {
    title: 'Renommer le filtre actuel',
    button: 'Enregistrer',
    input: 'Renommer le filtre personnalisé',
    icon: 'ri-edit-line',
    submitFn () {
      emit('updateFilterName', inputFilterName.value)
    },
  },
  delete: {
    title: 'Supprimer le filtre actuel',
    button: 'Supprimer',
    icon: 'ri-delete-bin-line',
    submitFn () {
      emit('deleteFilter')
    },
  },
} as const

type FilterModalType = keyof typeof filterLabelGroups;
const modalOrigin = ref()
const inputFilterName: Ref<string | undefined> = ref()
const filterModalType: Ref<FilterModalType> = ref('create')
const filterModalOpen: Ref<boolean> = ref(false)

const closeFilterModal = () => {
  filterModalOpen.value = false
}
const filterLabelGroup = computed(() => filterLabelGroups[filterModalType.value])
const openFilterModal = (modalType: FilterModalType) => {
  filterModalOpen.value = true
  filterModalType.value = modalType
  inputFilterName.value = modalType === 'create' ? '' : props.selectedFilter?.name
}
const saveCurrentFilter = () => {
  filterLabelGroup.value.submitFn()
  filterModalOpen.value = false
}
const resetAgGridFilters = () => {
  emit('selectFilter', null)
}

const filterList = computed(() => props.filters.map(({ id, name }) => ({ text: name, value: id })))

const onSelectFilterChange = ($event: string) => {
  emit('selectFilter', +$event)
}

const createOrUpdate = ($event) => {
  if (props.selectedFilter) {
    emit('updateFilter')
  } else {
    openFilterModal('create')
  }
}

</script>

<template>
  <div class="flex justify-end h-24">
    <DsfrSelect
      :model-value="selectedFilter?.id"
      label="Sélectionner un filtre"
      default-unselected-text="Aucun filtre sélectionné"
      :options="filterList"
      @update:model-value="onSelectFilterChange($event)"
    />
    <div class="fr-mx-2v fr-mt-2v flex justify-center items-center gap-2">
      <DsfrButton
        ref="modalOrigin"
        :disabled="!selectedFilter"
        type="submit"
        @click="resetAgGridFilters()"
      >
        <VIcon name="ri-filter-off-line" />
      </DsfrButton>
      <DsfrButton
        ref="modalOrigin"
        :disabled="!selectedFilter"
        type="submit"
        @click="openFilterModal('update')"
      >
        <VIcon name="ri-edit-line" />
      </DsfrButton>
      <DsfrButton
        ref="modalOrigin"
        :disabled="!selectedFilter"
        type="submit"
        @click="openFilterModal('delete')"
      >
        <VIcon name="ri-delete-bin-line" />
      </DsfrButton>
    </div>
    <div class="fr-mx-2v  fr-mt-2v  flex  justify-center  items-center  gap-2">
      <DsfrButton
        ref="modalOrigin"
        type="submit"
        :disabled="!!selectedFilter && !paginationChanged"
        @click="createOrUpdate()"
      >
        {{ !!selectedFilter ? 'Mettre à jour le filtre personnalisé' : 'Créer un nouveau filtre personnalisé' }}
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
          v-model="inputFilterName"
          type="text"
          :label="filterLabelGroup.input"
          label-visible
          placeholder="Mon filter personnalisé"
          :readonly="filterModalType === 'delete'"
        />
      </div>
      <div class="flex items-end">
        <DsfrButton
          type="submit"
          :label="filterLabelGroup.button"
          :icon="{ name: filterLabelGroup.icon }"
          icon-right
          :disabled="!inputFilterName"
        />
      </div>
    </form>
  </DsfrModal>
</template>
