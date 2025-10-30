<script lang="ts" setup>
import { computed } from 'vue'
import slugify from 'slugify'

import {
  PrefectureDictionary,
} from '@biblio-num/shared'
import type {
  FormatFunctionRefKeys,
  PrefectureKey,
} from '@biblio-num/shared'

import DelayStateBadge from '@/components/Badges/delay-state/DelayStateBadge.vue'
import AgGridAttachmentCell from '@/components/ag-grid/AgGridAttachmentCell.vue'
import { routeNames } from '@/router/route-names'

const props = defineProps<{
  params: {
    value: string
    column: {
      columnLabel: string
      formatFunctionRef: FormatFunctionRefKeys
      id: string
      isHeader?: boolean
      originalDescription?: string
      originalLabel?: string
      source: 'annotation' | 'champs' | 'fix-field'
      type: string
    }
  }
}>()

// TODO: check into @biblio-num/shared
const FieldType = {
  string: 'string',
  number: 'number',
  enum: 'enum',
  date: 'date',
  boolean: 'boolean',
  file: 'file',
} as const

//#region all cell
const cellValues = computed(() => {
  const cellValuesAsArray = Array.isArray(props.params.value) ? props.params.value : [props.params.value]
  return cellValuesAsArray.map((cv) => {
    if (props.params.column?.type === 'date') {
      cv = cv ? new Date(cv).toLocaleDateString() : ''
    }
    return cv
  })
})

const ffr = computed(() => {
  return props.params.column?.formatFunctionRef
})

const type = computed(() => {
  return props.params.column?.type
})

const componentRenderer = computed(() => {
  if (props.params.column?.formatFunctionRef === 'delay-status') {
    return markRaw(DelayStateBadge)
  }
  return null
})
//#endregion

//#region STATUS
type DsfrType = 'success' | 'error' | 'warning' | 'info' | 'new' | 'purple-glycine'
const statusDictionary: Record<string, { label: string; type: DsfrType }> = {
  accepte: { label: 'Accepté', type: 'success' },
  en_construction: { label: 'En construction', type: 'purple-glycine' },
  en_instruction: { label: 'En instruction', type: 'new' },
  refuse: { label: 'Refusé', type: 'error' },
  sans_suite: { label: 'sans_suite', type: 'warning' },
}
const giveStatusLabel = (status: string): string => {
  return statusDictionary[status]?.label || status
}
const giveStatusType = (status: string): DsfrType => {
  return statusDictionary[status]?.type || 'info'
}
//#endregion

const formattedNumber = (value: string) => new Intl.NumberFormat('fr-FR').format(Number(value))
//#region PAYS region
const getFlagURL = (countryName: string) => {
  if (!countryName?.length) {
    return ''
  }
  const slug = slugify(countryName, { lower: true, strict: true })
  return `/countries-svg/${slug}.svg`
}
//#endregion

//#region Prefecture
const getPrefecture = (prefecture: PrefectureKey) => {
  return PrefectureDictionary[prefecture]
}
//#endregion
</script>

<template>
  <!--  arrays -->
  <div>
    <div
      v-for="(cellValue, index) in cellValues"
      :key="index"
    >
      <template v-if="!!componentRenderer">
        <!-- ComponentRenderer -->
        <component
          :is="componentRenderer"
          :value="cellValue"
        />
      </template>

      <template v-else-if="ffr === 'country'">
        <!-- COUNTRY FLAG -->
        <div class="amount-line">
          <div
            :key="cellValue"
            class="round-flag fr-mr-1w"
            :style="{ backgroundImage: `url(${getFlagURL(cellValue)})` }"
          />
          <div>{{ cellValue || "pas de pays" }}</div>
        </div>
      </template>

      <template v-else-if="ffr === 'status'">
        <!-- STATUS -->
        <DsfrBadge
          class="text-nowrap"
          :label="giveStatusLabel(cellValue)"
          :type="giveStatusType(cellValue)"
          small
          no-icon
        />
      </template>

      <template v-else-if="['rnf', 'rna'].includes(ffr) && cellValue">
        <RouterLink
          class="no-underline"
          :to="{ name: routeNames.FICHE_ORGANISME, params: { id: cellValue.split(' ')[0] } }"
          @click.stop
        >
          <span>
            {{ cellValue.split(' | ')[0] }}
          </span>
        </RouterLink>
        <span class="ml-1">
          {{ cellValue.split(' | ')[1] }}
        </span>
      </template>

      <template v-else-if="ffr === 'file' && cellValue">
        <!-- File -->
        <p>
          <AgGridAttachmentCell :params="{ value: { uuid: cellValue } }" />
        </p>
      </template>

      <template v-else-if="type === 'boolean'">
        <!-- BOOLEAN -->
        <p>{{ cellValue === 'true' ? 'Oui' : 'Non' }}</p>
      </template>

      <template v-else-if="ffr === 'prefecture'">
        <!-- PREFECTURE -->
        <p>{{ getPrefecture(cellValue) }}</p>
      </template>

      <template v-else>
        <!-- Default -->
        <div class="amount-line">
          <p
            v-if="params.column?.type === FieldType.number"
            class="block  text-right"
          >
            {{ formattedNumber(cellValue) }}
          </p>
          <template v-else>
            <p class="text-nowrap overflow-hidden text-ellipsis max-w-[220px]" :title="cellValue || undefined">
              {{ cellValue ?? '' }}
            </p>
          </template>
        </div>
      </template>
    </div>
    <!--  date -->
  </div>
</template>

<style>
p {
  margin-bottom: 0.5rem !important;
}
.round-flag {
  display: block;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
}
.amount-line {
  --at-apply: flex items-center;
  height: 1.75rem;
}
</style>
