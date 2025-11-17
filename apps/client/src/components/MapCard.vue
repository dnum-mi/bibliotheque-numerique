<script setup lang="ts">
import { ref } from 'vue'
import type { View } from 'ol'
import { GeoJSON } from 'ol/format'

import markerIcon from '@/assets/map-marker.png'

const props = withDefaults(defineProps<{
  center?: [number, number]
  projection?: string
  zoom?: number
  marker?: boolean | [number, number]
  width?: string
  height?: string
  pinMarker?: boolean
}>(), {
  center: () => [40, 40],
  projection: 'EPSG:4326',
  zoom: 16,
  marker: true,
})

const view = ref<View>()
const map = ref<HTMLElement>()

watch(() => props.center, (newCenter) => {
  view.value?.setCenter(newCenter)
})

// #region marker
const geoJson = new GeoJSON()

const features = computed(() => [
  props.marker === true
    ? {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'Point',
          'coordinates': props.center,
        },
      }
    : props.marker,
])

const providerFeatureCollection = computed(() => ({
  type: 'FeatureCollection',
  features: features.value,
}))

const geoJsonFeatures = computed(() => geoJson.readFeatures(providerFeatureCollection.value))
// #endregion marker

function resetCenter () {
  view.value?.setCenter(props.center)
}
defineExpose({ resetCenter })
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
      :center="center"
      :zoom="zoom"
      :projection="projection"
    />

    <ol-tile-layer>
      <ol-source-osm />
    </ol-tile-layer>

    <ol-vector-layer>
      <ol-source-vector
        :features="geoJsonFeatures"
        :format="geoJson"
        :projection="projection"
      />
      <ol-style>
        <ol-style-icon v-if="pinMarker" :scale="1">
          <span class="marker">📍</span>
        </ol-style-icon>
        <ol-style-icon v-else :src="markerIcon" :scale="0.05" />
      </ol-style>
    </ol-vector-layer>
  </ol-map>
</template>

<style scoped>
.marker {
  padding: 10px;
  border-radius: 25px;
  margin: 5px;
  font-size: 25px;
}
</style>
