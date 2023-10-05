<script lang="ts" setup>
import BiblioNumDataTableAgGrid from '@/components/BiblioNumDataTableAgGrid.vue'
import LayoutList from '@/components/Layout/LayoutList.vue'
import { useDemarcheStore } from '@/stores/demarche'
import { dateToStringFr } from '@/utils'
import type { IDemarche } from '@biblio-num/shared'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import OrganismeBadgesRenderer from '@/components/Badges/OrganismeBadgesRenderer.vue'

const demarcheStore = useDemarcheStore()
const router = useRouter()
const headersJson = [
  {
    value: 'id',
    type: 'hidden',
    width: 0,
  },
  {
    text: 'N° Démarche DS',
    value: 'number',
    type: 'number',
    width: 200,
  },
  {
    text: 'Types',
    value: 'types',
    renderer: OrganismeBadgesRenderer,
    width: 200,
  },
  {
    text: 'Libellé de la démarche',
    value: 'title',
    type: 'text',
    width: 600,
  },
  {
    text: 'Créé le',
    value: 'dateCreation',
    parseFn: dateToStringFr,
    type: 'date',
    width: 200,
  },
  // TODO: Fonction de recupération des nombres de dossiers
  // {
  //   text: 'Dossiers',
  //   value: 'dossiers',
  //   parseFn: (value:any) => {
  //     return value?.nodes?.length
  //   },
  // },
  {
    text: 'Publié le',
    value: 'datePublication',
    parseFn: dateToStringFr,
    type: 'date',
    width: 200,
  },
]

const rowData = computed<IDemarche[]>(() => demarcheStore.demarches.map<IDemarche>(
  (d: IDemarche) => ({ ...d?.dsDataJson, types: d?.types, id: d.id } as IDemarche)),
)

onMounted(async () => {
  await demarcheStore.getDemarches()
})

const selectDemarche = (row:IDemarche[]) => {
  router.push({ name: 'DemarcheDossiers', params: { id: row[0].id } })
}

const rowStyle = { cursor: 'pointer' }

</script>

<template>
  <LayoutList>
    <template #title>
      <div class="bn-list-search bn-list-search-demarche">
        <span
          class="fr-icon-search-line fr-p-1w"
          aria-hidden="true"
        />
        <h6 class="bn-list-search-title-demarche fr-p-1w fr-m-0">
          Rechercher une démarche
        </h6>
      </div>
    </template>
    <BiblioNumDataTableAgGrid
      :headers="headersJson"
      action-title="Voir les détails de la démarche"
      :row-data="rowData"
      floating-filter
      row-selection="single"
      :row-style="rowStyle"
      @selection-changed="selectDemarche"
    />
  </LayoutList>
</template>
