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
      <DsfrButton
        :label="label"
        :disabled="disabled"
        :icon="icon"
        :icon-right="iconRight"
        @click="getDossiers(rowData)"
      />
    </DsfrTableRow>
  </DsfrTable>
</template>

<script lang="ts"  setup>
import { useDemarcheStore } from '@/stores/demarche'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const demarcheStore = useDemarcheStore()
const router = useRouter()
const label = 'Voir'
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
  {
    text: 'Dossiers',
    value: 'dossiers',
    parseFn: (value:any) => {
      return value?.nodes?.length
    },
  },
  {
    text: 'Published At',
    value: 'datePublication',
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
