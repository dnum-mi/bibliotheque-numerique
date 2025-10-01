<script setup lang="ts">
import apiClient from '@/api/api-client'
import useToaster from '@/composables/use-toaster'
import { REQUEST_MANUAL_RESET_PWD_SUCCESS } from '@/messages'
import { passwordValidator } from '@/utils/password.validator'
import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import { z } from 'zod'

const validationSchema = z
  .object({
    password: passwordValidator,
    passwordConfirm: z.string().min(1, 'La confirmation est requise'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['passwordConfirm'],
  })
type PasswordFormValues = z.infer<typeof validationSchema>

const route = useRoute()
const email = ref<string | null>(null)
const emailMissingError = ref(false)

const toaster = useToaster()

onMounted(() => {
  const emailFromQuery = route.query.email

  if (typeof emailFromQuery === 'string' && emailFromQuery.trim() !== '') {
    email.value = emailFromQuery
  } else {
    emailMissingError.value = true
  }
})

const alertTitle = ref('')
const alertDescription = ref('')
const isRequestSubmitted = ref(false)

const { handleSubmit } = useForm<PasswordFormValues>({
  validationSchema: toTypedSchema(validationSchema),
})

const { value: passwordValue, errorMessage: passwordError } = useField<string>('password')
const { value: passwordConfirmValue, errorMessage: passwordConfirmError } = useField<string>('passwordConfirm')

const onSubmit = handleSubmit(async (values) => {
  if (!email.value) {
    return
  }

  try {
    await apiClient.requestManualResetPassword({
      email: email.value,
      password: values.password,
    })
    isRequestSubmitted.value = true
    alertTitle.value = 'Demande envoyée'
    alertDescription.value = REQUEST_MANUAL_RESET_PWD_SUCCESS
  } catch {
    toaster.addErrorMessage(
      'Impossible de traiter votre demande pour le moment. Veuillez réessayer plus tard.',
    )
  }
})
</script>

<template>
  <LayoutAccueil>
    <div class="fr-container fr-m-5w">
      <div class="fr-container fr-grid-row">
        <div class="fr-col-1" />
        <div class="fr-col-10">
          <h5
            class="mb-20 fr-text-title--blue-france"
            style="text-align: center"
          >
            Créer un nouveau mot de passe
          </h5>

          <div
            v-if="emailMissingError"
            class="error-state"
          >
            <p>L'adresse e-mail n'a pas été fournie. Veuillez recommencer la procédure.</p>
            <router-link to="/reset-password">
              Mot de passe oublié ?
            </router-link>
          </div>

          <div v-else-if="isRequestSubmitted">
            <DsfrAlert
              :title="alertTitle"
              :description="alertDescription"
              type="info"
              class="mb-6"
            />
            <router-link to="/sign_in">
              Retour à la page de connexion
            </router-link>
          </div>

          <form
            v-else
            class="card"
            @submit.prevent="onSubmit"
          >
            <ToggleInputPassword
              id="password"
              v-model="passwordValue"
              label="Saisir votre nouveau mot de passe"
              :password-error="passwordError"
            />
            <PasswordHint :password="passwordValue" />
            <ToggleInputPassword
              id="passwordConfirm"
              v-model="passwordConfirmValue"
              label="Confirmer le nouveau mot de passe "
              :password-error="passwordConfirmError"
            />

            <div
              class="fr-m-4w"
              style="text-align: center"
            >
              <DsfrButton type="submit">
                Créer
              </DsfrButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </LayoutAccueil>
</template>
