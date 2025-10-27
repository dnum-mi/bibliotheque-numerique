<script setup lang="ts">
import { getPrefecture } from '@/utils'
import type { PrefectureKey } from '@biblio-num/shared'

const props = defineProps<{
  organismeId: string;
}>()

type Column = {
  field: string
  headerName: string
  hidden?: boolean
  getValue?: (value: string) => unknown
}

type DossierOutput = {
  demarcheTitle: string
  prefecture: PrefectureKey
  state: string
  dateDepot: Date
}

const columns: Column[] = [
  {
    field: 'demarcheTitle',
    headerName: 'Libellé',
  },
  {
    field: 'prefecture',
    headerName: 'Service instructeur',
    getValue: getPrefecture,
  },
  {
    field: 'state',
    headerName: 'État',
    getValue: (value: string) => ({ component: 'StatusBadge', status: value }),
  },
  {
    field: 'dateDepot',
    headerName: 'Dépôt',
    getValue: (value: string) => new Date(value).toLocaleDateString(),
  },
] as const

const headers = columns.map(({ headerName }) => headerName)

const rows: DossierOutput[] = [
  {
    demarcheTitle: '[Qualif] Déclaration des financements étrangers',
    prefecture: 'D00',
    state: 'En Construction',
    dateDepot: new Date('2024-03-18T15:15:56.000Z'),
  },
  {
    demarcheTitle: '[Qualif] Déclaration des financements étrangers',
    prefecture: 'D00',
    state: 'En Construction',
    dateDepot: new Date('2024-08-21T15:15:56.000Z'),
  },
  {
    demarcheTitle: '[Qualif] Déclaration des financements étrangers',
    prefecture: 'D00',
    state: 'En Construction',
    dateDepot: new Date('2024-05-13T15:15:56.000Z'),
  },
  {
    demarcheTitle: '[Qualif] Déclaration des financements étrangers',
    prefecture: 'D00',
    state: 'En Construction',
    dateDepot: new Date('2024-08-11T15:15:56.000Z'),
  },
]

const rowsdata = ref<DossierOutput[]>([])

const updateListeDossiers = async () => {
  rowsdata.value = rows.map((d) => {
    const row: unknown[] & { cursor?: string; title?: string; onClick: (event: MouseEvent) => void } = columns
      .filter(({ hidden }) => !hidden)
      .map(({ field, getValue }) => {
        if (getValue) {
          return getValue(d[field]) || '-'
        }
        return d[field] ?? '-'
      })

    return row
  })
}

watch(() => props.organismeId, updateListeDossiers, { immediate: true })
</script>

<template>
  <div class="flex w-full">
    <DsfrTable
      class="fr-text fr-text--bold bn-color-table w-full"
      :headers="headers"
      title=""
    >
      <tr
        v-for="(row, i) in rowsdata"
        :key="i"
      >
        <template
          v-for="(cell, j) of row"
          :key="j"
        >
          <DsfrTableCell
            class="w-full"
            :field="typeof cell === 'number' ? String(cell) : cell ?? '-'"
            :cell-attrs="cell.attrs ?? {}"
          />
        </template>
      </tr>
    </DsfrTable>
  </div>
</template>
