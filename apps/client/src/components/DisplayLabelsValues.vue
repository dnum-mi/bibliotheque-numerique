<script lang="ts" setup>
import type { IDemarche } from '@biblio-num/shared'
import { computed } from 'vue'

type LabelData = {
  text: string,
  value: string,
  parseFn?: (value: string | number) => string
}
type LabelsData = LabelData[]

const props = withDefaults(defineProps<{
    title: string,
    prefixId: string,
    datas?: Partial<IDemarche['dsDataJson']>,
    labels?: LabelsData,
  }>(), {
  datas: () => ({}),
  labels: () => [],
})

const dataCy = props.title ? `cy-${props.title}` : ''

type DataKey = keyof typeof props.datas
interface IField {
    id: string,
    label: string,
    value: string,
  }
const fields = computed<IField[]>(() => {
  return props.labels.map((labelElt: LabelData) => {
    const value = props.datas[labelElt?.value as DataKey]

    return {
      id: `${props.prefixId}-${labelElt?.value}`,
      label: labelElt?.text,
      value: value !== undefined ? (labelElt.parseFn ? labelElt.parseFn(value) : value) : '',
    }
  })
})
</script>

<template>
  <div
    v-if="fields?.length"
    :data-cy="dataCy"
    class="fr-container"
  >
    <div class="fr-grid-row">
      <div
        v-for="{ id, label, value} in fields"
        :key="id"
        class="fr-col-6 fr-grid-row"
      >
        <label
          :for="id"
          class="fr-text--bold fr-col-4"
        > {{ label }} : </label> <span
          :id="id"
          class="fr-text fr-col-8"
        > {{ value }}</span>
      </div>
    </div>
  </div>
</template>
