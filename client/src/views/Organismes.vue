<template>
  <LayoutList>
    <template #title>
      <DsfrSearchBar
        class="bn-list-search"
        placeholder="Rechercher un organisme"
      />
    </template>
    <BiblioNumDataTableAgGrid
      class="bn-table-organisme"
      pagination="false"
      :headers="headerJson"
      :row-data="rowData"
      row-selection="single"
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
// const props = defineProps<{ }>()

const organismeStore = useOrganismeStore()
const router = useRouter()

const formatData = (dataJson) => {
  return {
    titre: dataJson.titre,
    rna_id: dataJson.rna_id,
    // type: dataJson.type,
    prefecture: `${dataJson?.adresse_siege?.code_postal?.substring(0, 2) || ''} ${dataJson?.adresse_siege?.commune || ''}`,
    creation: dateToStringFr(dataJson?.date_creation),
    modification: dateToStringFr(dataJson?.mise_a_jour),
    type: 'CULTES',
  }
}
const rowData = computed(() => organismeStore.organismes.map(data => formatData(data.dataJson)))

const headerJson = [
  {
    text: 'Titre',
    value: 'titre',
  },
  {
    text: 'N°Org',
    value: 'rna_id',
  },
  {
    text: 'Type',
    value: 'type',
  },
  {
    text: 'Préfecture',
    value: 'prefecture',

  },
  {
    text: 'Création',
    value: 'creation',
  },
  {
    text: 'Modification',
    value: 'modification',
  },
  // {
  //   text: 'Représentant',
  // },

]

const onSelect = (e) => {
  console.log(e)
  router.push({ path: `/organismes/${e[0].rna_id}` })
  // router.push({ name: 'FicheOrganismes', params: { id: e.rna_id } })
}

onMounted(async () => {
  await organismeStore.loadOrganismes()
})
</script>
<style lang="css">
.bn-list-search {
  flex-direction: row-reverse;
  background-color: var(--border-plain-grey);
  height: 100%;
}
.bn-list-search > .fr-input {
  background-color: var(--border-plain-grey);
  color: var(--background-default-grey)
}
.bn-list-search > .fr-input::placeholder {
  color: var(--background-default-grey)
}
.bn-list-search > .fr-input:focus {
  outline: none;
}

.bn-list-search > .fr-btn {
  background-color: var(--border-plain-grey);
  align-self: center;
}

.bn-table-organisme {
  height: 100%;
}
</style>
