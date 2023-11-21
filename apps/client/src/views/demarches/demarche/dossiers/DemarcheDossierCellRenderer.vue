<script lang="ts" setup>
import { computed } from 'vue'
import slugify from 'slugify'

import type { FormatFunctionRefKeys } from '@biblio-num/shared'

import delayStateBadge from '@/components/Badges/DelayStateBadge.vue'
import AgGridAttachmentCell from '@/components/ag-grid/AgGridAttachmentCell.vue'
import { Prefecture, type PrefectureKeys } from '@/biblio-num/shared'

// TODO: check into @biblio-num/shared
const FieldType = {
  string: 'string',
  number: 'number',
  enum: 'enum',
  date: 'date',
  boolean: 'boolean',
  file: 'file',
} as const

const props = defineProps<{
  params: {
    value: string
    column: {
      type: string
      formatFunctionRef: FormatFunctionRefKeys
    }
  }
}>()

/* region all cell */
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
  if (props.params.column?.formatFunctionRef === 'delay-status') return delayStateBadge
  return null
})
/* endregion */

/* region STATUS */
type dsfrType = 'success' | 'error' | 'warning' | 'info' | 'new';
const statusDictionary: Record<string, { label: string; type: dsfrType }> = {
  accepte: { label: 'Accepté', type: 'success' },
  en_construction: { label: 'En construction', type: 'new' },
  en_instruction: { label: 'En instruction', type: 'new' },
  refuse: { label: 'Refusé', type: 'error' },
  sans_suite: { label: 'sans_suite', type: 'warning' },
}
const giveStatusLabel = (status: string): string => {
  return statusDictionary[status]?.label || status
}
const giveStatusType = (status: string): dsfrType => {
  return statusDictionary[status]?.type || 'info'
}
/* endregion */

const formattedNumber = computed(() => new Intl.NumberFormat('fr-FR').format(Number(props.params.value)))

/* region PAYS region */
const getFlagURL = (countryName: string) => {
  if (!countryName?.length) {
    return ''
  }
  const slug = slugify(countryName, { lower: true, strict: true })
  return `/countries-svg/${slug}.svg`
}
/* endregion */

/* region Prefecture */
const getPrefecture = (prefecture: PrefectureKeys) => {
  return Prefecture[prefecture]
}
/* endregion */
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

      <!-- RNF -->
      <template v-else-if="ffr === 'rnf' && cellValue">
        <RouterLink
          :to="{ name: 'FicheOrganisme', params: { id: cellValue }, query: { idType: 'Rnf' } }"
          @click.stop
        >
          {{ cellValue }}
        </RouterLink>
      </template>

      <!-- RNA -->
      <template v-else-if="ffr === 'rna' && cellValue">
        <RouterLink
          :to="{ name: 'FicheOrganisme', params: { id: cellValue }, query: {idType: 'Rna'} }"
          @click.stop
        >
          {{ cellValue }}
        </RouterLink>
      </template>

      <!-- File -->
      <template v-else-if="ffr === 'file' && cellValue">
        <AgGridAttachmentCell :params="{ value: { url: cellValue } }" />
      </template>

      <!-- BOOLEAN -->
      <template v-else-if="type === 'boolean'">
        {{ cellValue ? 'Oui': 'Non' }}
      </template>

      <!-- BOOLEAN -->
      <template v-else-if="ffr === 'prefecture'">
        {{ getPrefecture(cellValue) }}
      </template>

      <!-- ComponentRenderer-->
      <template v-else-if="!!componentRenderer">
        <component
          :is="componentRenderer"
          :value="cellValue"
        />
      </template>

      <!-- Default-->
      <template v-else>
        <span
          v-if="params.column.type === FieldType.number"
          class="block  text-right"
        >
          {{ formattedNumber }}
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
