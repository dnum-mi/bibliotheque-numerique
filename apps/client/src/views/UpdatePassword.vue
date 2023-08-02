
<script setup lang="ts">
import { ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import { z } from 'zod'

import { updatePassword } from '@/shared/services'
import { passwordValidator } from '@/utils/password.validator'
import { useRouter } from 'vue-router'

import useToaster from '@/composables/use-toaster'

const props = defineProps<{ token: string }>()

const router = useRouter()

const validationSchema = toTypedSchema(z.object({
  newPassword: passwordValidator,
  confirmPassword: passwordValidator,
}))

const { handleSubmit, setErrors } = useForm({
  validationSchema,
})

const alertType = ref('info')

const { value: newPasswordValue, errorMessage: passwordError } = useField<string>('newPassword')
const { value: confirmPasswordValue, errorMessage: confirmPasswordError } = useField<string>('confirmPassword')
const alertTitle = ref('')
const alertDescription = ref('')
const openAlert = ref(false)

const toaster = useToaster()

const onSubmit = handleSubmit(async () => {
  if (newPasswordValue.value !== confirmPasswordValue.value) {
    setErrors({ confirmPassword: 'Les mots de passe ne correspondent pas' })
    return
  }
  await updatePassword({ password: newPasswordValue.value, token: props.token })
  openAlert.value = true
  alertDescription.value = 'Votre mot de passe a été changé.'
  alertType.value = 'success'
  toaster.addSuccessMessage({ description: 'Votre mot de passe a été changé.' })
  router.push({ name: 'Home' })
})

const onCloseAlert = () => {
  openAlert.value = false
}
</script>

<template>
  <LayoutAccueil>
    <div class="fr-container fr-m-5w">
      <div
        class="fr-container fr-grid-row"
      >
        <div class="fr-col-1" />
        <div class="fr-col-10">
          <h5
            class="mb-20 fr-text-title--blue-france"
            style="text-align:center"
          >
            Modifier votre mot de passe
          </h5>
          <form
            class="card"
            @submit.prevent="onSubmit"
          >
            <DsfrInputGroup
              :is-valid="passwordError"
              :error-message="passwordError"
            >
              <DsfrInput
                id="newPassword"
                v-model="newPasswordValue"
                label="Saisir votre nouveau mot de passe"
                label-visible
                placeholder="xxxxxx"
                type="password"
              >
                <template #required-tip>
                  <em class="required-label"> *</em>
                </template>
              </DsfrInput>
            </DsfrInputGroup>

            <DsfrInputGroup
              :is-valid="confirmPasswordError"
              :error-message="confirmPasswordError"
            >
              <DsfrInput
                id="confirmPassword"
                v-model="confirmPasswordValue"
                label="Confrimer le nouveau mot de passe"
                label-visible
                placeholder="xxxxxx"
                type="password"
              >
                <template #required-tip>
                  <em class="required-label"> *</em>
                </template>
              </DsfrInput>
            </DsfrInputGroup>
            <div
              class="fr-m-4w"
              style="text-align:center"
            >
              <DsfrButton>
                Modifer
              </DsfrButton>
            </div>
            <DsfrAlert
              :title="alertTitle"
              :description="alertDescription"
              :type="alertType"
              :closed="!openAlert"
              closeable
              @close="onCloseAlert()"
            />
          </form>
        </div>
      </div>
    </div>
  </LayoutAccueil>
</template>
