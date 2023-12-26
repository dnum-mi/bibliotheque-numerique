<script lang="ts" setup>
const props = defineProps<{ params: { value: string[] } }>()

const cellValues = computed(() => {
  return props.params.value || []
})
</script>

<template>
  <div>
    <span
      v-for="(cellValue,index) in cellValues"
      :key="index"
      class="ag-row"
      style="display: block; background-color: transparent;"
    >
      {{ cellValue || '' }}
    </span>
  </div>
</template>
