<script lang="ts" setup>
import type { ILeanDossierOutput, IRole } from '@biblio-num/shared'
import { canAccessDemarche } from '@biblio-num/shared'

import apiClient from '@/api/api-client'
import useToaster from '@/composables/use-toaster'
import { routeNames } from '@/router/route-names'
import { getPrefecture } from '../../../utils'

const props = defineProps<{
  role: IRole;
  organismeId: number;
}>()

const router = useRouter()

type Column = {
  field: string;
  headerName: string;
  hidden?: boolean;
  getValue?: (value: string) => unknown;
}

const columns: Column[] = [
  {
    field: 'id',
    headerName: 'Id',
    hidden: true,
  },
  {
    field: 'demarcheId',
    headerName: 'Démarche',
    hidden: true,
  },
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

const headers = columns.filter(({ hidden }) => !hidden).map(({ headerName }) => headerName)

const rowsdata = ref<ILeanDossierOutput[]>([])

const toaster = useToaster()

const updateListeDossiers = async () => {
  try {
    const dossiers = await apiClient.getOrganismeDossiers(props.organismeId)
    rowsdata.value = dossiers.map((d) => {
      const row: unknown[] & { cursor?: string; title?: string; onClick: (event: MouseEvent) => void } = columns
        .filter(({ hidden }) => !hidden)
        .map(({ field, getValue }) => {
          if (getValue) {
            return getValue(d[field]) || '-'
          }
          return d[field] ?? '-'
        })
      if (canAccessDemarche(d.demarcheId, props.role)) {
        row.cursor = 'pointer'
        row.title = 'Cliquez pour accéder à ce dossier'
        row.onClick = () => {
          router.push({ name: routeNames.DOSSIERS, params: { id: d.id } })
        }
      } else {
        row.cursor = 'not-allowed'
        row.title = 'Vous n’avez pas accès à cette démarche, ce dossier est donc inaccessible'
      }
      return row
    }).sort((a, b) => {
      const dateA = a?.dateDepot?.getTime()
      const dateB = b?.dateDepot?.getTime()
      return dateB - dateA
    })
  } catch (error) {
    console.log(error)
    toaster.addErrorMessage({ description: 'Impossible de récupérer la liste des dossiers de cet organisme' })
  }
}

watch(() => props.organismeId, updateListeDossiers, { immediate: true })
</script>

<template>
  <DsfrTable
    title=""
    class="fr-text fr-text--bold bn-color-table w-full"
    :headers="headers"
  >
    <tr
      v-for="(row, i) of rowsdata"
      :key="i"
      tabindex="0"
      :style="{ cursor: row.cursor ?? 'auto' }"
      :title="row.title"
      @click="($event) => row.onClick?.($event)"
      @keyup.enter="($event) => row.onClick?.($event)"
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
</template>
