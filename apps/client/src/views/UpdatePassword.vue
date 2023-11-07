
<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import { z } from 'zod'
import { DsfrAlert } from '@gouvminint/vue-dsfr'

import apiClient from '@/api/api-client'
import { passwordValidator } from '@/utils/password.validator'

import useToaster from '@/composables/use-toaster'
import ToggleInputPassword from '@/components/ToggleInputPassword.vue'
import { routeNames } from '@/router/route-names'

const props = defineProps<{ token: string }>()

const router = useRouter()

const validationSchema = toTypedSchema(z.object({
  newPassword: passwordValidator,
  confirmPassword: passwordValidator,
}))

const { handleSubmit, setErrors } = useForm({
  validationSchema,
})

const alertType: Ref<InstanceType<typeof DsfrAlert>['$props']['type']> = ref('info')

const { value: newPasswordValue, errorMessage: newPasswordError } = useField<string>('newPassword')
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
  await apiClient.updatePassword({ password: newPasswordValue.value, token: props.token })
  openAlert.value = true
  alertDescription.value = 'Votre mot de passe a été changé.'
  alertType.value = 'success'
  toaster.addSuccessMessage({ description: 'Votre mot de passe a été changé.' })
  router.push({ name: routeNames.HOME })
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
            <ToggleInputPassword
              id="newPassword"
              v-model="newPasswordValue"
              label="Saisir votre nouveau mot de passe"
              :password-error="newPasswordError"
            />
            <PasswordHint :password="newPasswordValue" />
            <ToggleInputPassword
              id="confirmPassword"
              v-model="confirmPasswordValue"
              data-cy="confirm-password"
              label="Confirmer le nouveau mot de passe "
              :password-error="confirmPasswordError"
            />

            <div
              class="fr-m-4w"
              style="text-align:center"
            >
              <DsfrButton type="submit">
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
