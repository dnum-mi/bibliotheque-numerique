<script setup lang="ts">
import { z } from 'zod'
import { AxiosError } from 'axios'
import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm, useIsFormDirty, useIsFormValid } from 'vee-validate'

import type { ICreateUser } from '@biblio-num/shared-utils'

import apiClient from '@/api/api-client'
import { passwordValidator } from '@/utils/password.validator'
import { REQUIRED_FIELD_MESSAGE } from '@/messages'
import LayoutAccueil from '../../components/Layout/LayoutAccueil.vue'
import ToggleInputPassword from '@/components/ToggleInputPassword.vue'
import PasswordHint from '@/components/PasswordHint.vue'

const router = useRouter()

const validationSchema = toTypedSchema(z.object({
  firstname: z.string({ required_error: REQUIRED_FIELD_MESSAGE }).min(2, 'Ceci ne semble pas être un prénom'),
  lastname: z.string({ required_error: REQUIRED_FIELD_MESSAGE }).min(2, 'Ceci ne semble pas être un nom'),
  email: z.string({ required_error: REQUIRED_FIELD_MESSAGE }).email('Ceci semble être une adresse email invalide'),
  password: passwordValidator,
  job: z.string({ required_error: REQUIRED_FIELD_MESSAGE }).min(2, 'Cet intitulé est trop court.'),
}))

const { handleSubmit } = useForm<ICreateUser>({
  validationSchema,
})

const isDirty = useIsFormDirty()
const isFormValid = useIsFormValid()

const signInRoute = { name: 'SignIn' }
const onSubmit = handleSubmit(async (formValue: ICreateUser) => {
  try {
    await apiClient.createUser(formValue)
    await router.push(signInRoute)
  } catch (error) {
    if (error instanceof AxiosError) {
      passwordError.value = error.response?.data.msg ?? (`Impossible de créer l’utilisateur (${error.message})`)
    } else {
      passwordError.value = (error as Error).message
    }
  }
})

const { value: firstnameValue, errorMessage: firstnameError } = useField<string>('firstname')
const { value: lastnameValue, errorMessage: lastnameError } = useField<string>('lastname')
const { value: jobValue, errorMessage: jobError } = useField<string>('job')
const { value: emailValue, errorMessage: emailError } = useField<string>('email')
const { value: passwordValue, errorMessage: passwordError } = useField<string>('password')
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
            Inscrivez-vous
          </h5>
          <!-- FORM -->
          <form
            class="card"
            @submit="onSubmit($event)"
          >
            <!-- firstname -->
            <DsfrInputGroup
              :is-valid="firstnameError"
              :error-message="firstnameError"
            >
              <DsfrInput
                id="firstname"
                v-model="firstnameValue"
                label="Prénom"
                label-visible
                placeholder="Louis"
                type="text"
                required
              >
                <template #required-tip>
                  <em class="required-label"> *</em>
                </template>
              </DsfrInput>
            </DsfrInputGroup>

            <!-- lastname -->
            <DsfrInputGroup
              :is-valid="lastnameError"
              :error-message="lastnameError"
            >
              <DsfrInput
                id="lastname"
                v-model="lastnameValue"
                label="Nom"
                label-visible
                placeholder="Dubois"
                type="text"
                required
              >
                <template #required-tip>
                  <em class="required-label"> *</em>
                </template>
              </DsfrInput>
            </DsfrInputGroup>

            <!-- job -->
            <DsfrInputGroup
              :is-valid="jobError"
              :error-message="jobError"
            >
              <DsfrInput
                id="job"
                v-model="jobValue"
                label="Intitulé de la fonction"
                label-visible
                type="text"
                required
              >
                <template #required-tip>
                  <em class="required-label"> *</em>
                </template>
              </DsfrInput>
            </DsfrInputGroup>

            <!-- EMAIL -->
            <DsfrInputGroup
              :is-valid="emailError"
              :error-message="emailError"
            >
              <DsfrInput
                id="email"
                v-model="emailValue"
                label="Email"
                label-visible
                placeholder="louis.dubois@interieur.gouv.fr"
                type="email"
                required
              >
                <template #required-tip>
                  <em class="required-label"> *</em>
                </template>
              </DsfrInput>
            </DsfrInputGroup>

            <!-- PASSWORD -->
            <ToggleInputPassword
              id="password"
              v-model="passwordValue"
              label="Saisir un mot de passe"
            />

            <PasswordHint :password="passwordValue" />

            <div
              class="fr-m-4w"
              style="text-align:center"
            >
              <DsfrButton
                type="submit"
                :disabled="!isDirty || !isFormValid"
              >
                S'inscrire
              </DsfrButton>
            </div>
            <div
              class="fr-m-4w"
              style="text-align:center"
            >
              <RouterLink :to="signInRoute">
                Déjà inscrit? Connectez-vous ici.
              </RouterLink>
            </div>
          </form>
          <br>
        </div>
        <div class="fr-col-1" />
      </div>
    </div>
  </LayoutAccueil>
</template>
