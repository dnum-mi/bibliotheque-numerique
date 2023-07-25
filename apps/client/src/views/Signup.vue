<script setup lang="ts">
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { toFormValidator, toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import type { CreateUserDto } from '@biblio-num/shared'

import { createUser } from '@/shared/services/user.service'
import LayoutAccueil from '../components/LayoutAccueil.vue'
import { passwordValidator } from '@/utils/password.validator'
import { REQUIRED_FIELD_MESSAGE } from '@/messages'

const router = useRouter()

const validationSchema = toTypedSchema(z.object({
  firstName: z.string({ required_error: REQUIRED_FIELD_MESSAGE }).min(2, 'Ceci ne semble pas être un prénom'),
  lastName: z.string({ required_error: REQUIRED_FIELD_MESSAGE }).min(2, 'Ceci ne semble pas être un nom'),
  email: z.string({ required_error: REQUIRED_FIELD_MESSAGE }).email('Ceci semble être une adresse email invalide'),
  password: passwordValidator,
}))

const { handleSubmit } = useForm({
  validationSchema,
})

const signInPath = '/sign_in'
const onSubmit = handleSubmit(async (formValue: CreateUserDto) => {
  try {
    await createUser(formValue)
    await router.push(signInPath)
  } catch (e) {
    console.log(e)
  }
})

const { value: firstNameValue, errorMessage: firstNameError } = useField('firstName')
const { value: lastNameValue, errorMessage: lastNameError } = useField('lastName')
const { value: emailValue, errorMessage: emailError } = useField('email')
const { value: passwordValue, errorMessage: passwordError } = useField('password')
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
            Inscription
          </h5>
          <form
            class="card"
            @submit="onSubmit"
          >
            <DsfrInputGroup
              :is-valid="firstNameError"
              :error-message="firstNameError"
            >
              <DsfrInput
                id="firstName"
                v-model="firstNameValue"
                label="Prénom"
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

            <DsfrInputGroup
              :is-valid="lastNameError"
              :error-message="lastNameError"
            >
              <DsfrInput
                id="lastName"
                v-model="lastNameValue"
                label="Nom"
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

            <DsfrInputGroup
              :is-valid="passwordError"
              :error-message="passwordError"
            >
              <DsfrInput
                id="password"
                v-model="passwordValue"
                label="Mot de passe"
                label-visible
                placeholder="xxxxxx"
                type="password"
                required
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
                S'inscrire
              </DsfrButton>
            </div>
            <div
              class="fr-m-4w"
              style="text-align:center"
            >
              <router-link :to="signInPath">
                Déjà inscrit? Connectez-vous ici.
              </router-link>
            </div>
          </form>
          <br>
        </div>
        <div class="fr-col-1" />
      </div>
    </div>
  </LayoutAccueil>
</template>
