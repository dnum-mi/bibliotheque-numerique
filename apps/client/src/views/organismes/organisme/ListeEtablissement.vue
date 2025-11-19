<script setup lang="ts">
import type { IEstablishment } from '@biblio-num/shared'

interface EstablishmentsProps {
  acquiredEstablishments: IEstablishment[]
  secondaryEstablishments: IEstablishment[]
  cededEstablishments: IEstablishment[]
}

const props = defineProps<EstablishmentsProps>()

const activeAccordion = ref<number>(0)
const selectedEstablishment = ref<IEstablishment | null>(null)

const allEstablishments = computed(() => [
  ...props.acquiredEstablishments,
  ...props.secondaryEstablishments,
  ...props.cededEstablishments,
])

const getCoordinates = (est: IEstablishment) => {
  return est.address.coordinates
}

const getColor = (est: IEstablishment): string => {
  if (props.acquiredEstablishments.includes(est)) {
    return '#000091'
  }
  if (props.secondaryEstablishments.includes(est)) {
    return '#E1000F'
  }
  if (props.cededEstablishments.includes(est)) {
    return '#666666'
  }

  return '#161616'
}

const handleListClick = (est: IEstablishment) => {
  selectedEstablishment.value = est
}

const handleMapSelect = (est: IEstablishment) => {
  selectedEstablishment.value = est

  if (props.acquiredEstablishments.includes(est)) {
    activeAccordion.value = 0
  } else if (props.secondaryEstablishments.includes(est)) {
    activeAccordion.value = 1
  } else if (props.cededEstablishments.includes(est)) {
    activeAccordion.value = 2
  }
}

const handleMapReset = () => {
  selectedEstablishment.value = null
}
</script>

<template>
  <div class="establishment-layout-container">
    <div class="fr-grid-row fr-grid-row--gutters h-full">
      <div class="fr-col-12 fr-col-md-4 list-column">
        <div class="scrollable-content">
          <DsfrAccordionsGroup v-model="activeAccordion">
            <DsfrAccordion
              id="acquis"
              :title="`Établissements acquis (${acquiredEstablishments.length})`"
            >
              <div class="flex flex-col gap-4">
                <div v-if="acquiredEstablishments.length === 0" class="fr-text--sm fr-mb-2v">
                  Aucun établissement acquis.
                </div>
                <div
                  v-for="(est, index) in acquiredEstablishments"
                  :key="`acquis-${index}`"
                  class="fr-mb-2v"
                >
                  <DsfrCard
                    :title="est.name"
                    :detail="est.address.oneLine"
                    :description="`${est.type || 'Type inconnu'} (${est.acquiredType})`"
                    :title-link-attrs="{}"
                    is-clickable
                    size="sm"
                    :class="{ 'selected-card': selectedEstablishment === est }"
                    @click="handleListClick(est)"
                  />
                </div>
              </div>
            </DsfrAccordion>

            <DsfrAccordion
              id="secondaires"
              :title="`Établissements secondaires (${secondaryEstablishments.length})`"
            >
              <div class="fr-grid-row fr-grid-row--gutters">
                <div v-if="secondaryEstablishments.length === 0" class="fr-col-12 fr-text--sm">
                  Aucun établissement secondaire.
                </div>
                <div
                  v-for="(est, index) in secondaryEstablishments"
                  :key="`sec-${index}`"
                  class="fr-col-12"
                >
                  <DsfrCard
                    :title="est.name"
                    :detail="est.address.oneLine"
                    :description="est.type || 'Type inconnu'"
                    :title-link-attrs="{}"
                    is-clickable
                    size="sm"
                    :class="{ 'selected-card': selectedEstablishment === est }"
                    @click="handleListClick(est)"
                  />
                </div>
              </div>
            </DsfrAccordion>

            <DsfrAccordion
              id="cedes"
              :title="`Établissements cédés (${cededEstablishments.length})`"
            >
              <div class="fr-grid-row fr-grid-row--gutters">
                <div v-if="cededEstablishments.length === 0" class="fr-col-12 fr-text--sm">
                  Aucun établissement cédé.
                </div>
                <div
                  v-for="(est, index) in cededEstablishments"
                  :key="`ced-${index}`"
                  class="fr-col-12"
                >
                  <DsfrCard
                    :title="est.name"
                    :detail="est.address.oneLine"
                    :description="est.type || 'Type inconnu'"
                    :title-link-attrs="{}"
                    size="sm"
                    is-clickable
                    :class="{ 'selected-card': selectedEstablishment === est }"
                    @click="handleListClick(est)"
                  />
                </div>
              </div>
            </DsfrAccordion>
          </DsfrAccordionsGroup>
        </div>
      </div>

      <div
        class="fr-col-12 fr-col-md-8 map-column"
      >
        <div class="map-wrapper">
          <MapMarkers
            :items="allEstablishments"
            :center-on="selectedEstablishment"
            :get-coordinates="getCoordinates"
            :get-color="getColor"
            @select="handleMapSelect"
            @reset="handleMapReset"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.establishment-layout-container {
  height: calc(100vh - 310px);
  width: 100%;
  overflow: hidden;
}

@media (max-height: 780px) {
  .establishment-layout-container {
    height: calc(100vh - 260px);
  }
}

.h-full {
  height: 100%;
  margin: 0 !important;
  width: 100% !important;
}

.list-column {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.map-column {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.map-wrapper {
  flex: 1;
  min-height: 0;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

:deep(.selected-card) {
  border: 2px solid var(--blue-france-main-525);
  background-color: var(--background-alt-blue-france);
}

:deep(.fr-card) {
  cursor: pointer;
  transition: box-shadow 0.2s ease-in-out, background-color 0.2s;
}

:deep(.fr-card:hover) {
  box-shadow: var(--shadow-2);
}
</style>
