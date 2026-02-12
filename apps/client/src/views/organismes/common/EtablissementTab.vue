<script setup lang="ts">
import type { IEstablishment } from '@biblio-num/shared'
import { formatCurrency } from '@/utils/french-number'
import { useRandomId } from '@gouvminint/vue-dsfr'
import type { HeaderDataTable } from '@/shared/types/DataTable.type'
import EstablishmentStatusBadge from '@/components/Badges/establishment/EstablishmentStatusBadge.vue'
import type { RowDataType } from '@/components/datatable/client-side/DataTableClientSide.vue'
import { pluralize } from '@/utils/pluralize'
import TableTagInfo from '@/components/TableTagInfo.vue'
import { eEstablishmentStatus, establishmentStatusArray } from '@/shared/types/Establishment.type'
import type { EstablishmentStatusKey } from '@/shared/types/Establishment.type'

interface IEstablishmentViewModel extends IEstablishment {
  status: EstablishmentStatusKey
  formattedValue: string
}

interface EstablishmentsProps {
  acquiredEstablishments: IEstablishment[]
  secondaryEstablishments: IEstablishment[]
  cededEstablishments: IEstablishment[]
}

const props = defineProps<EstablishmentsProps>()

const allEstablishments = computed<(IEstablishmentViewModel & RowDataType)[]>(() => {
  const normalize = (list: IEstablishment[], status: EstablishmentStatusKey) =>
    list.map(e => {
      const id = useRandomId(e.name)
      return {
        ...e,
        id,
        status,
        formattedValue: formatCurrency(Number(e.value)) || '-',
        authorized: true,
        cursor: id,
      }
    })

  return [
    ...normalize(props.acquiredEstablishments, eEstablishmentStatus.ACQUIS),
    ...normalize(props.secondaryEstablishments, eEstablishmentStatus.SECONDAIRE),
    ...normalize(props.cededEstablishments, eEstablishmentStatus.CÉDÉ),
  ]
})

const stats = computed<{ label: string }[] | null>(() => {
  const c1 = props.acquiredEstablishments.length
  const c2 = props.secondaryEstablishments.length
  const c3 = props.cededEstablishments.length

  if (c1 === 0 && c2 === 0 && c3 === 0) {
    return null
  }

  return [
    { label: pluralize({ count: c1, singular: 'Bien acquis', plural: 'Biens acquis' }) },
    { label: pluralize({ count: c2, singular: 'Bien secondaire', plural: 'Biens secondaires' }) },
    { label: pluralize({ count: c3, singular: 'Bien cédé', plural: 'Biens cédés' }) },
  ]
})

const headers: HeaderDataTable[] = [
  {
    field: 'status',
    text: 'Statut',
    width: 150,
    renderer: markRaw(EstablishmentStatusBadge),
    filterable: true,
    filter: 'agSetColumnFilter',
    filterParams: {
      values: [...establishmentStatusArray],
      cellRenderer: markRaw(EstablishmentStatusBadge),
    },
  },
  { field: 'name', text: 'Nom' },
  {
    field: 'address',
    text: 'Adresse',
    valueFormatter: (params: any) => params.value?.oneLine || '-',
  },
  {
    field: 'type',
    text: 'Type de bien',
    width: 150,
    renderer: markRaw(TableTagInfo),
  },
  {
    field: 'value',
    text: 'Valeur',
    valueFormatter: (params: any) => params.value ? formatCurrency(Number(params.value)) : '-',
  },
]

const title = computed(() => pluralize({
  count: allEstablishments.value.length,
  singular: 'établissement',
  plural: 'établissements',
}))
</script>

<template>
  <div class="fr-container fr-py-4w">
    <div v-if="allEstablishments.length === 0">
      <p>Aucun établissement n'a été trouvé.</p>
    </div>

    <div v-else>
      <h2 class="fr-h4">
        {{ title }}
      </h2>
      <ul v-if="stats">
        <li v-for="stat in stats" :key="stat.label">
          {{ stat.label }}
        </li>
      </ul>
      <DataTableClientSide
        :rows-data="allEstablishments"
        :headers="headers"
        data-key="id"
      />
    </div>
  </div>
</template>

<style scoped></style>
