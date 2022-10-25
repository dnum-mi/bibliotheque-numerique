<script lang="ts" setup>
import { computed } from 'vue'

type TypeLabelData = {
  text: string,
  value: string,
  parseFn: (value: any) => string
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
      value: value ? (labelElt.parseFn ? labelElt.parseFn(value) : value) : '',
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
        class="fr-col-6"
      >
        <label
          :for="id"
          class="fr-text--bold"
        > {{ label }} :</label> <span
          :id="id"
          class="fr-text"
        > {{ value }}</span>
      </div>
    </div>
  </div>
</template>
