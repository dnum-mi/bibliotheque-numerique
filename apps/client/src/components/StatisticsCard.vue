<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { SmallDemarcheOutputDto } from '@biblio-num/shared'

import { useCustomFilterStore } from '@/stores/custom-filters'
import { DsfrButton } from '@gouvminint/vue-dsfr'

// TODO: will be in library
interface UserFriendlyFilter {
  label: string
  value: string
}

// will be in library
interface SmallCustomFilterDto {
  id: number
  name: string
  filters: UserFriendlyFilter[]
}

// TODO: will be in library
interface Total {
  label: string
  total: string
}

// TODO: will be in library
interface Card {
  customFilter: SmallCustomFilterDto,
  totals: Total[]
  demarche: SmallDemarcheOutputDto // already in library
}

const customFilterStore = useCustomFilterStore()

const createCardData = (customFilter: SmallCustomFilterDto) => {
  return {
    customFilter: {
      ...customFilter,
      filters: [
        {
          label: 'Pays',
          value: 'Qatar',
        },
        {
          label: 'Montant',
          value: 'Plus grand ou égal à 15 300 €',
        },
        {
          label: 'Dépot',
          value: new Intl.DateTimeFormat('en-US').format(createDate(0, Date.now())),
        },

      ],
    },
    ...createExtraCardData(),
  }
}
const createNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const createDate = (min, max) => new Date(Math.floor(Math.random() * (max - min + 1)) + min)

// TODO: REMPLACER LE BOUCHON
const createExtraCardData = () => ({
  demarche: {
    id: 2,
    name: 'Démarche Financement étranger',
    dsId: createNumber(1, 10000),
  },
  totals: [
    {
      label: 'Total des dossiers',
      total: String(createNumber(100, 300)),
    },
    {
      label: 'Total des montants',
      total: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(createNumber(15300, 3000000)),
    },
  ],
})

// TODO : Exemple de body de retour de la function stats
const cardsOld = reactive([
  {
    customFilter: {
      id: 42,
      name: 'Tableau personalisé 1',
      filters: [
        {
          label: 'Pays',
          value: 'Qatar',
        },
        {
          label: 'Montant',
          value: 'Plus grand ou égal à 15 300 €',
        },
      ],
    },
    demarche: {
      id: 1,
      name: 'Demarche Fiancement étranger',
      dsId: 43,
    },
    totals: [
      {
        label: 'Total des dossiers',
        total: '233',
      },
      {
        label: 'Total des montants',
        total: '1 233 000 €',
      },
    ],
  },
  {
    customFilter: {
      id: 44,
      name: 'Tableau personalisé 1',
      filters: [
        {
          label: 'Pays',
          value: 'Qatar',
        },
        {
          label: 'Montant',
          value: 'Plus grand ou égal à 15 300 €',
        },
        {
          label: 'Dépot',
          value: 'Le 12 janvier 2023',
        },
      ],
    },
    demarche: {
      id: 1,
      name: 'Demarche Fiancement étranger',
      dsId: 45,
    },
    totals: [
      {
        label: 'Total des dossiers',
        total: '233',
      },
      {
        label: 'Total des montants',
        total: '1 233 000 €',
      },
    ],
  },
])

const cards = computed(() => customFilterStore.customFilters.map(createCardData))

const customFilterToDelete = ref()
const showModal = (customFilter) => {
  customFilterToDelete.value = customFilter
}

const deleteFilter = (id: number) => {
  customFilterStore.deleteCustomFilter(id)
  customFilterToDelete.value = undefined
}

onMounted(() => {
  if (!cards.value?.length) {
    customFilterStore.getCustomFilters()
  }
})
</script>

<template>
  <div
    v-for="card of cards"
    :key="card"
    class="card fr-card half"
  >
    <div class="">
      <strong>N° DS: {{ card.demarche.dsId }}</strong> - {{ card.demarche.name }}
    </div>
    <div class="wrapper-title">
      <span class="fr-text--bold text-xl"> [{{ card.customFilter.name }}]</span>
      <div>
        <button
          type="button"
          class="fr-icon-close-line"
          aria-hidden="true"
          @click.prevent="
            $event.target.parentElement.parentElement.parentElement.style.display = 'none'
          "
        />
        <button
          type="button"
          class="fr-icon-delete-line"
          aria-hidden="true"
          @click.prevent="showModal(card.customFilter)"
        />
      </div>
    </div>
    <div class="flex  my-4">
      <div class="half">
        <ul class="list-none  m-0  p-0">
          <li
            v-for="filter of card.customFilter.filters"
            :key="filter.label"
            class="my-2"
          >
            <p class="uppercase  my-1  p-0  text-sm  text-gray-500  text-sm">
              {{ filter.label }}
            </p>
            <p class="m-0  p-0  font-bold  text-sm">
              {{ filter.value }}
            </p>
          </li>
        </ul>
      </div>

      <div class="half">
        <ul class="list-none  m-0  p-0">
          <li
            v-for="total of card.totals"
            :key="total.label"
          >
            <p class="uppercase  my-1  p-0  text-sm  text-gray-500  text-sm">
              {{ total.label }}
            </p>
            <p class="text-4xl">
              {{ total.total }}
            </p>
          </li>
        </ul>
      </div>
    </div>
    <div class="flex justify-end">
      <RouterLink
        class="fr-link  fr-icon-arrow-right-line  fr-link--icon-right"
        :to="{
          name: 'DemarcheDossiers',
          params: { id: card.demarche.id },
          query: { customFilter: card.customFilter.id },
        }"
      >
        Visualiser la liste
      </RouterLink>
    </div>
  </div>
  <template v-if="customFilterToDelete">
    <DsfrModal
      :opened="customFilterToDelete"
      :title="`Supprimer le filtre personnalisé ${customFilterToDelete?.name}`"
      @close="customFilterToDelete = undefined"
    >
      <p>Êtes-vous sûr·e de vouloir supprimer ce filtre personnalisé ?</p>

      <div class="flex  gap-2  justify-end">
        <DsfrButton
          class="alert"
          @click="deleteFilter(customFilterToDelete.id)"
        >
          Supprimer <span class="fr-icon-delete-line" />
        </DsfrButton>
        <DsfrButton @click="customFilterToDelete = undefined">
          Annuler
        </DsfrButton>
      </div>
    </DsfrModal>
  </template>
</template>
<style>
.alert {
  --hover: var(--error-425-625);
  --active: var(--error-425-625);
  --background-action-high-blue-france: var(--error-425-625);
}
.card {
  padding: 2em;
  min-width: 600px;
}
.wrapper-title {
  display: flex;
  margin-top: 1em;
  justify-content: space-between;
}
.half {
  flex-basis: 48%;
  flex-grow: 0;
  flex-shrink: 0;
}
</style>
