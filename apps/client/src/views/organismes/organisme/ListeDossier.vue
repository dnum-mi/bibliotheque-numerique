<script lang="ts" setup>
import apiClient from '@/api/api-client'
import useToaster from '@/composables/use-toaster'
import { routeNames } from '@/router/route-names'

const router = useRouter()

const headers = [
  // {
  //   text: 'Id',
  // },
  {
    text: 'Libellé',
  },
  {
    text: 'Préfecture',
  },
  {
    text: 'État',
  },
  {
    text: 'Dépôt',
  },
]

const props = defineProps<{
  organismeId: number;
}>()

const rowsdata = ref([])

const toaster = useToaster()

const updateListeDossiers = async () => {
  try {
    const dossiers = await apiClient.getOrganismeDossiers(props.organismeId)
    rowsdata.value = dossiers.map((d) =>
      Object.entries(d)
        .map(([k, v]) => {
          if (typeof v === 'number') {
            return [k, String(v)]
          }
          if (k.includes('date') || k.includes('Date')) {
            return [k, new Date(v).toLocaleDateString()]
          }
          if (k === 'state') {
            return [k, { component: 'StatusBadge', status: v }]
          }
          return [k, v]
        })
        .map(([k, v]) => v),
    )
  } catch (error) {
    toaster.addErrorMessage({ description: 'Une erreur a été détectée' })
  }
}

watch(() => props.organismeId, updateListeDossiers, { immediate: true })
</script>

<template>
  <DsfrTable
    class="fr-text fr-text--bold bn-color-table w-full"
    :headers="headers"
  >
    <tr
      v-for="(row, i) of rowsdata"
      :key="i"
      tabindex="0"
      :style="{ cursor: 'pointer' }"
      @click="
        () => {
          router.push({ name: routeNames.DOSSIERS, params: { id: row[0] } });
        }
      "
      @keyup.enter="
        () => {
          router.push({ name: routeNames.DOSSIERS, params: { id: row[0] } });
        }
      "
    >
      <template
        v-for="(cell, j) of row"
        :key="j"
      >
        <DsfrTableCell
          class="w-full"
          :field="typeof cell === 'number' ? String(cell) : cell ?? '-'"
          :cell-attrs="j === 0 ? { style: { display: 'none' } } : {}"
        />
      </template>
    </tr>
  </DsfrTable>
</template>
