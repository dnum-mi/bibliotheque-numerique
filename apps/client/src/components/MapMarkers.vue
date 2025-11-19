<script setup lang="ts" generic="T">
import 'ol/ol.css'
import OlMap from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { fromLonLat } from 'ol/proj'
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import type MapBrowserEvent from 'ol/MapBrowserEvent'

export interface MapMarkersProps<T> {
  items: T[]
  getCoordinates: (item: T) => [number, number] | null
  getColor?: (item: T) => string
  centerOn?: T | null
  defaultZoom?: number
  defaultCenter?: [number, number]
}

const props = withDefaults(defineProps<MapMarkersProps<T>>(), {
  getColor: () => '#000091',
  defaultZoom: 6,
  defaultCenter: () => [2.2137, 46.2276],
})

const emit = defineEmits<{
  (e: 'select', item: T): void
  (e: 'reset'): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
const mapInstance = shallowRef<OlMap | null>(null)
const vectorSource = new VectorSource()

const featureToItemMap = new Map<string, T>()

const createStyle = (color: string) => {
  return new Style({
    image: new CircleStyle({
      radius: 8,
      fill: new Fill({ color }),
      stroke: new Stroke({ color: '#fff', width: 2 }),
    }),
  })
}

onMounted(() => {
  if (!mapContainer.value) {
    return
  }

  const vectorLayer = new VectorLayer({ source: vectorSource })

  mapInstance.value = new OlMap({
    target: mapContainer.value,
    layers: [new TileLayer({ source: new OSM() }), vectorLayer],
    view: new View({
      center: fromLonLat(props.defaultCenter),
      zoom: props.defaultZoom,
    }),
  })
  mapInstance.value.on('click', (event) => {
    const mbe = event as MapBrowserEvent<PointerEvent>
    const feature = mapInstance.value?.forEachFeatureAtPixel(mbe.pixel, (f) => f)
    if (feature) {
      // @ts-ignore ol_uid existe sur les features
      const uid = feature.ol_uid
      const item = featureToItemMap.get(uid)

      if (item) {
        emit('select', item)
      }
    }
  })

  updateFeatures()
})

watch(() => props.items, updateFeatures, { deep: true })

watch(
  () => props.centerOn,
  (newItem) => {
    if (newItem && mapInstance.value) {
      const coords = props.getCoordinates(newItem)
      if (coords) {
        mapInstance.value.getView().animate({
          center: fromLonLat(coords),
          zoom: 14,
          duration: 800,
        })
      }
    }
  },
)

function updateFeatures () {
  vectorSource.clear()
  featureToItemMap.clear()

  const features: Feature[] = []

  props.items.forEach((item) => {
    const coords = props.getCoordinates(item)
    if (!coords) {
      return
    }

    const feature = new Feature({
      geometry: new Point(fromLonLat(coords)),
    })

    feature.setStyle(createStyle(props.getColor(item)))
    features.push(feature)

    feature.set('itemData', item)
  })

  vectorSource.addFeatures(features)

  features.forEach((f) => {
    // @ts-ignore ol_uid existe sur les features
    featureToItemMap.set(f.ol_uid, f.get('itemData'))
  })

  if (features.length > 0 && !props.centerOn && mapInstance.value) {
    const extent = vectorSource.getExtent()
    mapInstance.value.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 14 })
  }
}

const resetView = () => {
  if (!mapInstance.value) {
    return
  }

  emit('reset')

  const featureCount = vectorSource.getFeatures().length

  if (featureCount > 0) {
    const extent = vectorSource.getExtent()
    mapInstance.value.getView().fit(extent, {
      padding: [50, 50, 50, 50],
      duration: 800,
      maxZoom: 14,
    })
  } else {
    mapInstance.value.getView().animate({
      center: fromLonLat(props.defaultCenter),
      zoom: props.defaultZoom,
      duration: 800,
    })
  }
}
</script>

<template>
  <div class="map-wrapper">
    <div
      ref="mapContainer"
      class="generic-map-container"
    />
    <DsfrButton
      type="button"
      icon="ri-focus-3-line"
      title="Recentrer la carte"
      class="rounded-full self-end absolute top-0 right-0"
      icon-only
      @click.stop="resetView"
    />
  </div>
</template>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.generic-map-container {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}
</style>
