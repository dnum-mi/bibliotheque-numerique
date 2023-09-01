<script lang="ts" setup>
import { defineProps, computed } from 'vue'

const props = defineProps<{ params: any }>()

const cellValues = computed(() => {
  const cellValuesAsArray = (Array.isArray(props.params.value) ? props.params.value : [props.params.value])
  return cellValuesAsArray.map((cv) => {
    if (props.params.column.type === 'date') {
      cv.value = new Date(cv.value).toLocaleDateString()
    }
    return cv
  })
})
</script>

<template>
  <!--  arrays -->
  <div>
    <span
      v-for="(cellValue, index) in cellValues"
      :key="index"
      style="display: block; background-color: transparent"
    >
      {{ cellValue || "" }}
    </span>
    <!--  date -->
  </div>
</template>

<style scoped></style>
