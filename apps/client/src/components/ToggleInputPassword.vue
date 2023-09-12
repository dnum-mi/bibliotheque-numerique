<script setup lang="ts">
import { ref, computed } from 'vue'
import { useField, useForm } from 'vee-validate'

const { value: passwordValue, errorMessage: passwordError } = useField('password')
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
        id="password"
        v-model="passwordValue"
        :type="tmpType"
        label="Mot de passe (6 caractères minimum)"
        label-visible
        placeholder="xxxxxx"
        required
      >
        <template #required-tip>
          <em class="required-label"> *</em>
        </template>
      </DsfrInput>
      <button
        type="button"
        class="btn absolute  right-2  top-[55%]"
        @click.prevent="togglePassword"
      >
        <Vicon
          :class="eyeIcon"
          :name="eyeIcon"
          scale="1.25"
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
