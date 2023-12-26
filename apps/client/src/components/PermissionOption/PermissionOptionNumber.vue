<script lang="ts" setup>
const props = defineProps<{
  optionName: string,
  defaultOption: number | number[],
  multiple: boolean
}>()
const emit = defineEmits(['updateOption'])
const options = ref<string[]>(props.defaultOption
  ? (typeof props.defaultOption === 'number' ? [props.defaultOption.toString()] : props.defaultOption.map(o => o?.toString()))
  : [])

const onChange = (id: number, value: string) => {
  if (value) {
    options.value[id] = value
  } else {
    delete options.value[id]
    options.value = options.value.filter(String)
  }
  emit('updateOption', props.optionName,
    props.multiple ? options.value.map((v) => parseInt(v)) : parseInt(options.value[0]),
  )
}
</script>

<template>
  <div class="multiple-input-number">
    <div
      v-for="n in (multiple ? options.length : 0) + 1"
      :key="optionName+n"
      class="input-number"
    >
      <DsfrInput
        :id="optionName+n"
        :model-value="options[n-1]"
        type="number"
        @update:model-value="(value: string) => onChange(n-1, value)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .multiple-input-number {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    justify-content: start;
    flex-wrap: wrap;
    .input-number {
      width: 5rem;
      margin-right: 1rem;
    }
  }
</style>
