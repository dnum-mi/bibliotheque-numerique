<template>
  <div
    :data-fr-theme="dark ? 'dark' : ''"
    style="background-color: var(--grey-1000-50); color: var(--g800); padding: 1rem;"
  >
    <h1>Démarches</h1>
  </div>
  <DsfrTable
    :title="title"
    :headers="headers"
  >
    <DsfrTableRow
      v-for="rowData in rows"
      :key="rowData.number"
      :row-data="rowData.slice(1)"
      :row-attrs="rowAttrs"
    >
      <td>
        <DsfrButton
          :label="label"
          :disabled="disabled"
          :icon="icon"
          :icon-right="iconRight"
          @click="getDossiers(rowData)"
        />
      </td>
    </DsfrTableRow>
  </DsfrTable>
</template>

<script lang="ts"  setup>
import { LANG_FOR_DATE_TIME } from '@/config'
import { useDemarcheStore } from '@/stores/demarche'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const DateToStringFn = (value:any) => {
  return value
    ? (new Date(value)).toLocaleString(LANG_FOR_DATE_TIME)
    : ''
}

const demarcheStore = useDemarcheStore()
const router = useRouter()
const label = 'Voir'
const icon = 'ri-search-line'
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
    parseFn: DateToStringFn,
  },
  {
    text: 'Libelle',
    value: 'title',
  },
  {
    text: 'Service',
    value: 'service',
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
    parseFn: DateToStringFn,
  },
]

const rows = computed<any[]>(() => demarcheStore.demarches.map(demarche => headersJson.map(header => `${
  (header.parseFn ? header.parseFn(demarche[header.value]) : demarche[header.value]) || ''
}`)))
const headers = computed<string[]>(() => ['Action', ...headersJson.filter(header => header.text).map(header => header.text)])

onMounted(async () => {
  await demarcheStore.getDemarches()
})

function getDossiers (row: any[]) {
  router.push({ name: 'DemarcheDossiers', params: { id: row[0] } })
}
</script>

<style scoped>

</style>
