<script lang="ts" setup>
import { defineProps, computed } from 'vue'
import slugify from 'slugify'

const props = defineProps<{ params: any }>()

/* region all cell */
const cellValues = computed(() => {
  const cellValuesAsArray = (Array.isArray(props.params.value) ? props.params.value : [props.params.value])
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
/* endregion */

/* region STATUS */
type dsfrType = 'success' | 'error' | 'warning' | 'info' | 'new'
const statusDictionary: Record<string, { label: string, type: dsfrType }> = {
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

/* region PAYS region */
const getFlagURL = (countryName: string) => {
  if (!countryName?.length) {
    return ''
  }
  const slug = slugify(countryName, { lower: true, strict: true })
  return `/countries-svg/${slug}.svg`
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

      <!-- DEFAULT -->
      <template v-else>
        {{ cellValue || "" }}
      </template>
    </div>
    <!--  date -->
  </div>
</template>

<style>
.ag-cell-wrapper {
  //height: 100% !important;
}
span.round-flag {
  display: block !important;
  width: 25px !important;
  height: 25px !important;
  border-radius: 50%;
  background-size: cover !important;
  background-position: center !important;
}
</style>
