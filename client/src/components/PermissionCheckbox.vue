<script lang="ts" setup>
import PermissionOption from '@/components/PermissionOption/PermissionOption.vue'
interface PermissionElement {
  id: string
  name: string
  active: boolean
  options: Record<string, any>
  optionsTypes: Record<string, any>
}
const props = defineProps<{
  permission: PermissionElement,
}>()
const emit = defineEmits(['changePermissionOption'])
const permission = props?.permission || {}
const optionsTypesArray = permission.optionsTypes ? Object.keys(permission.optionsTypes) : []

const onChange = (optionName: string, value: any) => {
  emit('changePermissionOption', props.permission.name, optionName, value)
}
</script>

<template>
  <div v-if="permission">
    <DsfrCheckbox
      :id="permission.id"
      v-model="permission.active"
      :name="permission.name"
    >
      <template #label>
        {{ permission.name }}
      </template>
    </DsfrCheckbox>
    <div v-if="permission.active">
      <div
        v-for="optionType in optionsTypesArray"
        :key="optionType"
      >
        <PermissionOption
          :option-name="optionType"
          :default-option="permission.options[optionType]"
          :option-type="permission.optionsTypes[optionType]"
          @update-option="onChange"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
