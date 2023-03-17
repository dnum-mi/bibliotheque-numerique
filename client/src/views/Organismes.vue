<template>
  <LayoutList>
    <template #title>
      <div class="bn-list-search bn-list-search-organisme">
        <span
          class="fr-icon-search-line fr-p-1w"
          aria-hidden="true"
        />
        <h6 class="bn-list-search-title-organisme fr-p-1w fr-m-0">
          Rechercher un organisme
        </h6>
      </div>
    </template>
    <BiblioNumDataTableAgGrid
      pagination="false"
      :headers="headerJson"
      :row-data="rowData"
      row-selection="single"
      :floating-filter="true"
      @selection-changed="onSelect"
    />
  </LayoutList>
</template>
<script lang="ts" setup>

import BiblioNumDataTableAgGrid from '@/components/BiblioNumDataTableAgGrid.vue'
import LayoutList from '@/components/LayoutList.vue'
import { useOrganismeStore } from '@/stores/organisme'
import { dateToStringFr } from '@/utils/dateToString'

import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const organismeStore = useOrganismeStore()
const router = useRouter()

const rowData = computed(() => organismeStore.organismes)

const headerJson = [
  {
    text: 'Titre',
    value: 'title',
  },
  {
    text: 'N°Org',
    value: 'idRef',
  },
  // {
  //   text: 'Type',
  //   value: 'type',
  //   // cellRenderer: BadgeTypeOrganisme,
  // },
  {
    text: 'Préfecture',
    value: 'prefecture',
  },
  {
    text: 'Création',
    value: 'dateCreation',
    parseFn: dateToStringFr,
    type: 'date',
  },
  {
    text: 'Modification',
    value: 'dateModification',
    parseFn: dateToStringFr,
    type: 'date',
  },
  {
    text: 'Déclaration',
    value: 'dateDeclaration',
    parseFn: dateToStringFr,
    type: 'date',

  },
  {
    text: 'Publication',
    value: 'datePublication',
    parseFn: dateToStringFr,
    type: 'date',
  },
  {
    text: 'Dissolution',
    value: 'dateDissolution',
    parseFn: dateToStringFr,
    type: 'date',
  },
]

const onSelect = (e) => {
  router.push({ path: `/organismes/${e[0].idRef}` })
}

onMounted(async () => {
  await organismeStore.loadOrganismes()
})
</script>
