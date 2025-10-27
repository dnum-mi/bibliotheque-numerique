<script setup lang="ts">
import type { siafV2 } from '@biblio-num/shared'
import MapCard from '@/components/MapCard.vue'

type EstablishmentAcquiredType = 'gratuit' | 'onéreux'

interface IEstablishment {
  name: string
  address: siafV2.ISiafAddress
  type: string | null
  value: number | null
  acquiredType: EstablishmentAcquiredType
}

const acquiredEstablishments: IEstablishment[] = [
  {
    name: 'Siège social (Donation)',
    address: {
      oneLine: '5 Rue du Parc 75014 Paris',
      coordinates: [2.326, 48.833], // [lon, lat]
      rnaAddress: null,
      dsAddress: {
        cityName: 'Paris',
        cityCode: '75114',
        label: '5 Rue du Parc 75014 Paris',
        postalCode: '75014',
        type: 'housenumber',
        countryCode: 'FR',
        countryName: 'France',
        departmentName: 'Paris',
        departmentCode: '75',
        regionName: 'Île-de-France',
        regionCode: '11',
        streetAddress: 'Rue du Parc',
        streetNumber: '5',
        streetName: 'Rue du Parc',
      },
    },
    type: 'Immeuble de rapport',
    value: 150000,
    acquiredType: 'gratuit',
  },
  {
    name: 'Local Lyon Confluence',
    address: {
      oneLine: '10 Quai Antoine Riboud 69002 Lyon',
      coordinates: [4.818, 45.744], // [lon, lat]
      rnaAddress: null,
      dsAddress: {
        cityName: 'Lyon',
        cityCode: '69002',
        label: '10 Quai Antoine Riboud 69002 Lyon',
        postalCode: '69002',
        type: 'housenumber',
        countryCode: 'FR',
        countryName: 'France',
        departmentName: 'Rhône',
        departmentCode: '69',
        regionName: 'Auvergne-Rhône-Alpes',
        regionCode: '84',
        streetAddress: 'Quai Antoine Riboud',
        streetNumber: '10',
        streetName: 'Quai Antoine Riboud',
      },
    },
    type: 'Bureau',
    value: 80000,
    acquiredType: 'onéreux',
  },
]
const secondaryEstablishments: IEstablishment[] = [
  {
    name: 'Antenne Paris 19e',
    address: {
      oneLine: '100 Avenue de Flandre 75019 Paris',
      coordinates: [2.373, 48.889], // [lon, lat]
      rnaAddress: null,
      dsAddress: {
        cityName: 'Paris',
        cityCode: '75019',
        label: '100 Avenue de Flandre 75019 Paris',
        postalCode: '75019',
        type: 'housenumber',
        countryCode: 'FR',
        countryName: 'France',
        departmentName: 'Paris',
        departmentCode: '75',
        regionName: 'Île-de-France',
        regionCode: '11',
        streetAddress: 'Avenue de Flandre',
        streetNumber: '100',
        streetName: 'Avenue de Flandre',
      },
    },
    type: 'Local associatif',
    value: null,
    acquiredType: 'gratuit',
  },
  {
    name: 'Espace Jeunes Marseille',
    address: {
      oneLine: '50 Rue de la République 13002 Marseille',
      coordinates: [5.37, 43.3], // [lon, lat]
      rnaAddress: null,
      dsAddress: {
        cityName: 'Marseille',
        cityCode: '13002',
        label: '50 Rue de la République 13002 Marseille',
        postalCode: '13002',
        type: 'housenumber',
        countryCode: 'FR',
        countryName: 'France',
        departmentName: 'Bouches-du-Rhône',
        departmentCode: '13',
        regionName: 'PACA',
        regionCode: '93',
        streetAddress: 'Rue de la République',
        streetNumber: '50',
        streetName: 'Rue de la République',
      },
    },
    type: "Centre d'accueil",
    value: 200000,
    acquiredType: 'onéreux',
  },
]

const cededEstablishments: IEstablishment[] = [
  {
    name: 'Ancien bureau Lille (Cédé)',
    address: {
      oneLine: '2 Place du Théâtre 59800 Lille',
      coordinates: [3.065, 50.637], // [lon, lat]
      rnaAddress: null,
      dsAddress: {
        cityName: 'Lille',
        cityCode: '59350',
        label: '2 Place du Théâtre 59800 Lille',
        postalCode: '59800',
        type: 'housenumber',
        countryCode: 'FR',
        countryName: 'France',
        departmentName: 'Nord',
        departmentCode: '59',
        regionName: 'Hauts-de-France',
        regionCode: '32',
        streetAddress: 'Place du Théâtre',
        streetNumber: '2',
        streetName: 'Place du Théâtre',
      },
    },
    type: 'Bureau',
    value: 50000,
    acquiredType: 'onéreux',
  },
]

const mapCardRef = ref<InstanceType<typeof MapCard> | null>(null)
const activeAccordion = ref(0)

const activeEstablishments = computed(() => [...acquiredEstablishments, ...secondaryEstablishments])

const initialCenter = computed(() => {
  return activeEstablishments.value[0]?.address.coordinates || [2.3522, 48.8566]
})

const establishmentToFeature = (establishment: IEstablishment) => ({
  type: 'Feature',
  properties: {
    name: establishment.name,
    address: establishment.address.oneLine,
  },
  geometry: {
    type: 'Point',
    coordinates: establishment.address.coordinates, // [lon, lat]
  },
})

const allMapFeatures = computed(() => {
  return activeEstablishments.value.map(establishmentToFeature)
})

function focusOnEstablishment (establishment: IEstablishment) {
  mapCardRef.value?.setCenterAndZoom(establishment.address.coordinates)
}
</script>

<template>
  <div class="fr-grid-row fr-grid-row--gutters fr-p-2v">
    <div class="fr-col-12 fr-col-md-4">
      <DsfrAccordionsGroup v-model="activeAccordion">
        <DsfrAccordion
          id="acquis"
          :title="`Établissements acquis (${acquiredEstablishments.length})`"
        >
          <div class="flex flex-col gap-4">
            <div
              v-for="est in acquiredEstablishments"
              :key="est.name"
            >
              <DsfrCard
                :title="est.name"
                :detail="est.address.oneLine"
                :description="`${est.type} (${est.acquiredType})`"
                is-clickable
                size="sm"
                @click="focusOnEstablishment(est)"
              />
            </div>
          </div>
        </DsfrAccordion>

        <DsfrAccordion
          id="secondaires"
          :title="`Établissements secondaires (${secondaryEstablishments.length})`"
        >
          <div class="fr-grid-row fr-grid-row--gutters">
            <div
              v-for="est in secondaryEstablishments"
              :key="est.name"
              class="fr-col-12"
            >
              <DsfrCard
                :title="est.name"
                :detail="est.address.oneLine"
                :description="`${est.type}`"
                is-clickable
                size="sm"
                @click="focusOnEstablishment(est)"
              />
            </div>
          </div>
        </DsfrAccordion>

        <DsfrAccordion
          id="cedes"
          :title="`Établissements cédés (${cededEstablishments.length})`"
        >
          <div class="fr-grid-row fr-grid-row--gutters">
            <div
              v-for="est in cededEstablishments"
              :key="est.name"
              class="fr-col-12"
            >
              <DsfrCard
                :title="est.name"
                :detail="est.address.oneLine"
                size="sm"
                :description="`${est.type}`"
                @click="focusOnEstablishment(est)"
              />
            </div>
          </div>
        </DsfrAccordion>
      </DsfrAccordionsGroup>
    </div>

    <div
      class="fr-col-12 fr-col-md-8"
      style="min-height: 70vh; position: relative"
    >
      <MapCard
        ref="mapCardRef"
        :zoom="10"
        :center="initialCenter"
        :features-list="allMapFeatures"
        pin-marker
      />
      <DsfrButton
        type="button"
        icon="ri-focus-3-line"
        tertiary
        title="Recentrer la carte"
        class="rounded-full self-end absolute top-0 right-0 fr-m-1w"
        style="z-index: 1000"
        icon-only
        @click="mapCardRef?.resetCenter()"
      />
    </div>
  </div>
</template>

<style scoped>
/* Assure que la carte prend toute la hauteur de sa colonne */
.fr-col-md-7 {
  display: flex;
  flex-direction: column;
}
.fr-col-md-7 > :deep(.ol-map) {
  flex-grow: 1;
}

/* Améliore le style de la carte cliquable */
:deep(.fr-card) {
  cursor: pointer;
  transition: box-shadow 0.2s ease-in-out;
}
:deep(.fr-card:hover) {
  box-shadow: var(--shadow-2);
}
</style>
