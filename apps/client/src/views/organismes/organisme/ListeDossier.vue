<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import apiClient from '@/api/api-client'
import useToaster from '@/composables/use-toaster'
import type { DsfrTableHeaderProps } from '@gouvminint/vue-dsfr/types/components/DsfrTable/DsfrTableHeader.vue'

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
  organismeId: number
}>()

const rowsdata = ref([])

const toaster = useToaster()

const updateListeDossiers = async () => {
  try {
    const dossiers = await apiClient.getOrganismeDossiers(props.organismeId)
    rowsdata.value = dossiers
      .map(d =>
        Object.entries(d)
          .map(([k, v]) => {
            if (typeof v === 'number') {
              return [k, String(v)]
            }
            console.log({ k })
            if (k.includes('date') || k.includes('Date')) {
              return [k, new Date(v).toLocaleDateString()]
            }
            if (k === 'state') {
              return [k, { component: 'StatusBadge', status: v }]
            }
            return [k, v]
          }).map(([k, v]) => v),
      )
  } catch (error) {
    toaster.addErrorMessage({ description: 'Une erreur a été détectée' })
  }
}

watch(() => props.organismeId, updateListeDossiers, { immediate: true })
</script>

<template>
  <div class="fr-col-5">
    <div class="fr-col-12 fr-mb-2w fr-pt-5v fr-pl-5v">
      <div class="fr-mr-2w bn-icon--green-archipel">
        <span
          class="fr-icon-book-2-line"
          aria-hidden="true"
        />
      </div>

      <span class="fr-text fr-text--bold">Dossiers déposés</span>
    </div>
    <DsfrTable
      class="fr-text fr-text--bold bn-color-table"
      :headers="headers"
    >
      <tr
        v-for="(row, i) of rowsdata"
        :key="i"
        tabindex="0"
        :style="{ cursor: 'pointer' }"
        @click="() => { router.push({ name: 'Dossiers', params: { id: row[0] } }) }"
        @keyup.enter="() => { router.push({ name: 'Dossiers', params: { id: row[0] } }) }"
      >
        <template
          v-for="(cell, j) of row"
          :key="j"
        >
          <DsfrTableCell
            :field="typeof cell === 'number' ? String(cell) : (cell ?? '-')"
            :cell-attrs="j === 0 ? { style: { display: 'none' } } : {}"
          />
        </template>
      </tr>
    </DsfrTable>
  </div>
</template>
