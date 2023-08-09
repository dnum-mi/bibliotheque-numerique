<template>
  <LayoutList>
    <template #title>
      <div class="bn-list-search bn-list-search-demarche">
        <span
          class="fr-icon-search-line fr-p-1w"
          aria-hidden="true"
        />
        <h6 class="bn-list-search-title-demarche fr-p-1w fr-m-0">
          Rechercher démarches
        </h6>
      </div>
    </template>
    <BiblioNumDataTableAgGrid
      :headers="headersJson"
      :row-data="rowData"
      with-action
      floating-filter
      @get-elt="getDossiers"
    />
  </LayoutList>
</template>

<script lang="ts" setup>
import BiblioNumDataTableAgGrid from '@/components/BiblioNumDataTableAgGrid.vue'
import LayoutList from '@/components/LayoutList.vue'
import { useDemarcheStore } from '@/stores/demarche'
import { dateToStringFr } from '@/utils/dateToString'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const demarcheStore = useDemarcheStore()
const router = useRouter()
const headersJson = [
  {
    value: 'id',
  },
  {
    text: 'Id',
    value: 'number',
  },
  {
    text: 'Création',
    value: 'dateCreation',
    parseFn: dateToStringFr,
    type: 'date',
  },
  {
    text: 'Le libellé',
    value: 'title',
  },
  {
    text: 'Service',
    value: 'service',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parseFn: (value:any) => {
      return `${value?.nom} - ${value?.organisme}`
    },
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
    text: 'La date de publication',
    value: 'datePublication',
    parseFn: dateToStringFr,
    type: 'date',
  },
  {
    text: "Type d'organisme",
    value: 'typeOrganisme',
  },
]

const rowData = computed(() => demarcheStore.demarches.map(
  (d: any) => ({ ...d?.dsDataJson, typeOrganisme: d?.typeOrganisme, id: d.id })),
)

onMounted(async () => {
  await demarcheStore.getDemarches()
})

function getDossiers (data: any) {
  router.push({ name: 'DemarcheDossiers', params: { id: data.id } })
}
</script>
