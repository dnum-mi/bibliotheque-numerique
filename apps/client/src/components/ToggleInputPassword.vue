<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: string
  passwordError?: string
  label?: string
  id?: string
}>(), {
  modelValue: '',
  passwordError: '',
  label: 'Mot de passe (15 caractères minimum)',
  id: 'password',
})

const emit = defineEmits<{
  'update:modelValue': [password: string],
}>()
const tmpType = ref('password')
const tmpTitle = computed(() => (tmpType.value === 'password' ? 'Afficher le mot de passe' : 'Masquer le mot de passe'))
const eyeIcon = computed(() => (tmpType.value === 'password' ? 'fr-icon-eye-fill' : 'fr-icon-eye-off-fill'))

const togglePassword = () => {
  tmpType.value = tmpType.value === 'password' ? 'text' : 'password'
}
</script>

<template>
  <DsfrInputGroup
    :is-valid="passwordError"
    :error-message="passwordError"
  >
    <div class="relative">
      <DsfrInput
        :id="id"
        :model-value="modelValue"
        :type="tmpType"
        :label="label"
        label-visible
        placeholder="xxxxxx"
        required
        @update:model-value="$emit('update:modelValue', $event)"
      >
        <template #required-tip>
          <em class="required-label"> *</em>
        </template>
      </DsfrInput>
      <button
        type="button"
        class="btn  absolute  right-2  bottom-0  transform  translate-y-[-30%]"
        @click.prevent="togglePassword"
      >
        <span
          :class="eyeIcon"
          :name="eyeIcon"
          :title="tmpTitle"
        />
      </button>
    </div>
  </DsfrInputGroup>
</template>

<style lang="css" scoped>
.btn {
  background-color: transparent !important;
}
</style>
