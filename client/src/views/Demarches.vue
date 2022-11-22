<template>
  <div
    :data-fr-theme="dark ? 'dark' : ''"
    style="background-color: var(--grey-1000-50); color: var(--g800); padding: 1rem;"
  >
    <h1>Démarches</h1>
  </div>

  <BiblioNumDataTableAgGrid
    :title="title"
    :headers="headersJson"
    :datas="demarches"
    @get-elt="getDossiers"
  />
</template>

<script lang="ts"  setup>
import BiblioNumDataTableAgGrid from '@/components/BiblioNumDataTableAgGrid.vue'
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
    text: 'Created At',
    value: 'dateCreation',
    parseFn: dateToStringFr,
  },
  {
    text: 'Libelle',
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
  // TODO: Fontion de recupéreration des nombres de dossiers
  // {
  //   text: 'Dossiers',
  //   value: 'dossiers',
  //   parseFn: (value:any) => {
  //     return value?.nodes?.length
  //   },
  // },
  {
    text: 'Published At',
    value: 'datePublication',
    parseFn: dateToStringFr,
  },
  {
    text: "Type d'organasime",
    value: 'typeOrganisme',
  },
]

const demarches = computed(() => demarcheStore.demarches)

onMounted(async () => {
  await demarcheStore.getDemarches()
})

function getDossiers (data) {
  router.push({ name: 'DemarcheDossiers', params: { id: data.id } })
}
</script>

<style scoped>

</style>
