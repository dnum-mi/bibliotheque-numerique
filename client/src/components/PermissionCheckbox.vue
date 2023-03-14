<script lang="ts" setup>
import PermissionOption from '@/components/PermissionOption/PermissionOption.vue'
interface PermissionElement {
  id: string
  name: string
  active: boolean
  options: Record<string, any>
  optionsTypes: Record<string, any>
}
const props = withDefaults(defineProps<{
  permission: PermissionElement | null,
}>(), {
  permission: () => null,
})
const emit = defineEmits(['update:permission'])
const optionsTypesArray = props.permission?.optionsTypes ? Object.keys(props.permission.optionsTypes) : []

const onActive = (active: boolean) => {
  const newPermission = { ...props.permission } as PermissionElement
  newPermission.active = active
  emit('update:permission', newPermission)
}
const onChange = (optionName: string, value: any) => {
  const newPermission = { ...props.permission } as PermissionElement
  newPermission.options[optionName] = value
  emit('update:permission', newPermission)
}
</script>

<template>
  <div v-if="permission">
    <DsfrCheckbox
      :id="permission.id"
      :model-value="permission.active"
      :name="permission.name"
      @update:modelValue="onActive"
    >
      <template #label>
        {{ permission.name }}
      </template>
    </DsfrCheckbox>
    <div v-if="permission.active && optionsTypesArray.length > 0">
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
