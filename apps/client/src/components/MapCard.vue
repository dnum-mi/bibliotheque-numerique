<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { View } from 'ol'
import { GeoJSON } from 'ol/format'
import { fromLonLat, get as getProjection } from 'ol/proj'

const props = withDefaults(defineProps<{
  center?: [number, number]
  zoom?: number
  featuresList?: any[]
  width?: string
  height?: string
  pinMarker?: boolean
}>(), {
  center: () => [2.3522, 48.8566],
  zoom: 16,
  featuresList: () => [],
  pinMarker: true,
})

const view = ref<View>()
const map = ref<HTMLElement>()

const dataProjection = getProjection('EPSG:4326')!
const featureProjection = getProjection('EPSG:3857')!

const transformedCenter = computed(() => fromLonLat(props.center))

watch(transformedCenter, (newCenter) => {
  view.value?.setCenter(newCenter)
})

// #region marker
const geoJson = new GeoJSON()

const providerFeatureCollection = computed(() => ({
  type: 'FeatureCollection',
  features: props.featuresList,
}))

const geoJsonFeatures = computed(() =>
  geoJson.readFeatures(providerFeatureCollection.value, {
    dataProjection,
    featureProjection,
  }),
)
// #endregion marker

function setCenter (coords: [number, number]) {
  view.value?.setCenter(fromLonLat(coords))
}

function setCenterAndZoom (coords: [number, number], newZoom = 17) {
  view.value?.animate({
    center: fromLonLat(coords),
    zoom: newZoom,
    duration: 500,
  })
}

function resetCenter () {
  view.value?.setCenter(transformedCenter.value)
  view.value?.setZoom(props.zoom)
}

defineExpose({ resetCenter, setCenter, setCenterAndZoom })
</script>

<template>
  <ol-map
    ref="map"
    :load-tiles-while-animating="true"
    :load-tiles-while-interacting="true"
    class="h-full w-full"
  >
    <ol-view
      ref="view"
      :center="transformedCenter"
      :zoom="zoom"
    />

    <ol-tile-layer>
      <ol-source-osm />
    </ol-tile-layer>

    <ol-vector-layer>
      <ol-source-vector
        :features="geoJsonFeatures"
      />

      <ol-style>
        <ol-style-circle :radius="8">
          <ol-style-fill color="rgba(227, 6, 19, 0.8)" />
          <ol-style-stroke color="white" :width="2" />
        </ol-style-circle>
      </ol-style>
    </ol-vector-layer>
  </ol-map>
</template>
