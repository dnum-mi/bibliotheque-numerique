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
      v-for="(rowData) in rows"
      :row-data="rowData"
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
    text: 'Id',
    value: 'number',
  },

  {
    text: 'Created At',
    value: 'dateAt',
  },
  {
    text: 'Libelle',
    value: 'title',
  },
  {
    text: 'Service',
    value: 'service',
  },
  {
    text: 'Dossiers',
    value: 'Dossiers',
  },
  {
    text: 'Published At',
    value: 'dateDepublication',
  },
]

const rows = computed<any[]>(() => demarcheStore.demarches.map(demarche => headersJson.map(header => `${demarche[header.value] || ''}`)))
const headers = computed<string[]>(() => ['Action', ...headersJson.map(header => header.text)])

onMounted(async () => {
  await demarcheStore.getDemarches()
})

function getDossiers (row: any[]) {
  router.push({ name: 'DemarcheDossiers', params: { id: row[0] } })
}
</script>

<style scoped>

</style>
