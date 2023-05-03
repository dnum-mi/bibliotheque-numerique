<script lang="ts" setup>
import { computed } from 'vue'

type TypeLabelData = {
  text: string,
  value: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseFn?: (value: any) => string
}
type TypeLabelsData = TypeLabelData[]

const props = withDefaults(defineProps<{
    title: string,
    prefixId: string,
    datas?: object,
    labels?: TypeLabelsData,
  }>(), {
  datas: () => ({}),
  labels: () => [],
})

const dataCy = props.title ? `cy-${props.title}` : ''

type keyOfDatas = keyof typeof props.datas
interface IField {
    id: string,
    label: string,
    value: string,
  }
const fields = computed<IField[]>(() => {
  return props.labels.map<IField>((labelElt: TypeLabelData) => {
    const value = props.datas[labelElt?.value as keyOfDatas]

    return {
      id: `${props.prefixId}-${labelElt?.value}`,
      label: labelElt?.text,
      value: value !== undefined ? (labelElt.parseFn ? labelElt.parseFn(value) : value) : '',
    }
  },
  )
})

</script>

<template>
  <!-- <h3> {{ title }} </h3> -->

  <div
    v-if="datas"
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
          class="fr-text--bold fr-col-4 bn-text--shadow"
        > {{ label }} : </label> <span
          :id="id"
          class="fr-text fr-col-8 bn-text--shadow"
        > {{ value }}</span>
      </div>
    </div>
  </div>
</template>
