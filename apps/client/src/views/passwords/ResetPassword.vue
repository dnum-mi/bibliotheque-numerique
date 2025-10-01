<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import { z } from 'zod'
import type { IResetPasswordInput } from '@biblio-num/shared'

import apiClient from '@/api/api-client'
import { ASK_RESET_PWD_SUCCESS, REQUEST_MANUAL_RESET_PWD } from '../../messages'
import { routeNames } from '@/router/route-names'

const validationSchema = toTypedSchema(
  z.object({
    email: z
      .string({ required_error: 'Veuillez saisir votre adresse courriel' })
      .nonempty('Veuillez saisir votre adresse courriel')
      .email('L’adresse courriel ne semble pas valide'),
  }),
)

const { handleSubmit } = useForm({
  validationSchema,
})

const { value: emailValue, errorMessage: emailError } = useField<string>('email', undefined, { initialValue: '' })
const alertTitle = ref('')
const alertDescription = ref('')
const isRequestSubmitted = ref(false)

const onSubmit = handleSubmit(async (formValue: IResetPasswordInput) => {
  await apiClient.resetPassword(formValue)
  isRequestSubmitted.value = true
  alertDescription.value = ASK_RESET_PWD_SUCCESS
})
</script>

<template>
  <LayoutAccueil>
    <div class="fr-container fr-m-5w">
      <div class="fr-container fr-grid-row">
        <div class="fr-col-1" />
        <div class="fr-col-10">
          <h5 class="mb-20 text-center fr-text-title--blue-france">
            Réinitialisation de votre mot de passe
          </h5>
          <form
            class="card"
            @submit.prevent="onSubmit"
          >
            <DsfrInputGroup
              :is-valid="emailError"
              :error-message="emailError"
            >
              <DsfrInput
                id="email"
                v-model="emailValue"
                label="Courriel"
                label-visible
                placeholder="louis.dubois@interieur.gouv.fr"
                type="email"
              >
                <template #required-tip>
                  <em class="required-label"> *</em>
                </template>
              </DsfrInput>
            </DsfrInputGroup>
            <div
              class="fr-m-4w"
              style="text-align: center"
            >
              <DsfrButton type="submit">
                Envoyer
              </DsfrButton>
            </div>
          </form>
          <div v-show="isRequestSubmitted">
            <DsfrAlert
              :title="alertTitle"
              :description="alertDescription"
              type="info"
              class="mb-6"
            />
            <router-link to="/sign_in">
              Retour à la page de connexion
            </router-link>
            <span class="fr-hr-or my-4">
              ou
            </span>
            <router-link :to="{ name: routeNames.UPDATE_PASSWORD_TO_VALIDATE, query: { email: emailValue } }">
              {{ REQUEST_MANUAL_RESET_PWD }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </LayoutAccueil>
</template>
