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

import delayStateBadge from '@/components/Badges/delay-state/DelayStateBadge.vue'
import AgGridAttachmentCell from '@/components/ag-grid/AgGridAttachmentCell.vue'
import { firstUpperCase } from '@/utils/first-upper-case'
import { routeNames } from '@/router/route-names'

const props = defineProps<{
  params: {
    value: string
    column: {
      type: string
      formatFunctionRef: FormatFunctionRefKeys
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
    if (props.params.column.type === 'date') {
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
    return delayStateBadge
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
      style="display: block; background-color: transparent"
    >
      <!-- COUNTRY FLAG -->
      <template v-if="ffr === 'country'">
        <div class="flex items-center">
          <span
            :key="cellValue"
            class="round-flag fr-mr-1w"
            :style="{ backgroundImage: `url(${getFlagURL(cellValue)})` }"
          />
          {{ cellValue || "pas de pays" }}
        </div>
      </template>

      <!-- STATUS -->
      <template v-else-if="ffr === 'status'">
        <DsfrBadge
          :label="giveStatusLabel(cellValue)"
          :type="giveStatusType(cellValue)"
          small
          no-icon
        />
      </template>

      <!-- RNF & RNA -->
      <template v-else-if="['rnf', 'rna'].includes(ffr) && cellValue">
        <template v-if="cellValue.substring(0, 5) === 'ERROR'">
          <span
            class="text-red-500 cursor-not-allowed"
          >
            ⚠️ {{ cellValue.substring(6) }}
          </span>
        </template>
        <template v-else-if="cellValue.substring(0, 5) === 'QUEUE'">
          <span
            class="fr-text-label--beige-gris-galet cursor-not-allowed"
          >
            ⌛️{{ cellValue.substring(6) }}
          </span>
        </template>
        <template v-else>
          <RouterLink
            :to="{ name: routeNames.FICHE_ORGANISME, params: { id: cellValue }, query: { idType: firstUpperCase(ffr) } }"
            @click.stop
          >
            {{ cellValue }}
          </RouterLink>
        </template>
      </template>

      <!-- File -->
      <template v-else-if="ffr === 'file' && cellValue">
        <AgGridAttachmentCell :params="{ value: { uuid: cellValue } }" />
      </template>

      <!-- BOOLEAN -->
      <template v-else-if="type === 'boolean'">
        {{ cellValue === 'true' ? 'Oui' : 'Non' }}
      </template>

      <!-- BOOLEAN -->
      <template v-else-if="ffr === 'prefecture'">
        {{ getPrefecture(cellValue) }}
      </template>

      <!-- ComponentRenderer -->
      <template v-else-if="!!componentRenderer">
        <component
          :is="componentRenderer"
          :value="cellValue"
        />
      </template>

      <!-- Default -->
      <template v-else>
        <span
          v-if="params.column.type === FieldType.number"
          class="block  text-right"
        >
          {{ formattedNumber(cellValue) }}
        </span>
        <template v-else>
          {{ cellValue ?? '' }}
        </template>
      </template>
    </div>
    <!--  date -->
  </div>
</template>

<style>
.round-flag {
  display: block;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
}
</style>
