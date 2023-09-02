<script lang="ts" setup>
import { computed, ComputedRef, nextTick, ref } from 'vue'
import { useDemarcheStore } from '@/stores'
import DemarcheConfigurationMappingColumn from '@/views/demarches/demarche/configuration/DemarcheConfigurationMappingColumn.vue'
import type { MappingColumn } from '@biblio-num/shared'

const title = 'La configuration'

const demarcheStore = useDemarcheStore()
const demarcheConfiguration: ComputedRef<MappingColumn[]> = computed(() => demarcheStore.currentDemarcheConfiguration)

// after update, array is re-arrange. For user comfort, we scroll to the updated element and blink it
const mappingColumnContainerRef = ref(null)
const handleColumnUpdated = (id: string) => {
  nextTick(() => {
    const element = document.querySelector(`[data-id="${id}"]`)
    if (!element) return

    const elementTop = element.getBoundingClientRect().top + window.scrollY
    const viewportHeight = window.innerHeight
    const elementHeight = element.offsetHeight

    const scrollTo = elementTop - (viewportHeight / 2) + (elementHeight / 2)

    window.scrollTo({
      top: scrollTo,
      behavior: 'smooth', // for smooth scrolling
    })

    element.classList.add('background-blue')
    setTimeout(() => {
      element.classList.remove('background-blue')
      element.classList.add('background-transparent')
    }, 1)
    setTimeout(() => {
      element.classList.remove('background-transparent')
    }, 10000)
  })
}
</script>

<template>
  <div>
    <h3 class="fr-text-title--blue-france">
      {{ title }}
    </h3>
    <div class="fr-text--alt fr-pb-3w">
      Sélectionnez les champs ou les annotations privés afin de les afficher dans la liste des dossiers de cette démarche.
    </div>

    <div
      ref="mappingColumnContainerRef"
      class="fr-pb-3v"
    >
      <div class="fr-grid-row">
        <div class="fr-col-1 fr-p-2v">
          <label class="fr-text--bold" />
        </div>
        <div class="fr-col-1 fr-p-2v">
          <label class="fr-text--bold"> Type Champs</label>
        </div>
        <div class="fr-col-5 fr-p-2v">
          <label class="fr-text--bold"> Libellé origine</label>
        </div>
        <div class="fr-col-5 fr-p-2v">
          <label class="fr-text--bold"> Libellé personnalisé</label>
        </div>
      </div>
      <div
        v-for="mappingColumn in demarcheConfiguration"
        :key="mappingColumn.id"
        :data-id="mappingColumn.id"
        class="fr-grid-row fr-m-1v"
      >
        <DemarcheConfigurationMappingColumn
          :mapping-column="mappingColumn"
          @column-updated="handleColumnUpdated(mappingColumn.id)"
        />
        <template v-if="mappingColumn.children?.length">
          <template
            v-for="childMappingColumn of mappingColumn.children"
            :key="childMappingColumn.id"
          >
            <DemarcheConfigurationMappingColumn
              :mapping-column="childMappingColumn"
              is-children
              @column-updated="handleColumnUpdated(mappingColumn.id)"
            />
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<style>
.background-blue {
  background: var(--artwork-minor-blue-france);
}
.background-transparent {
  background: transparent;
  transition: background-color 3s ease-in;
}
</style>
