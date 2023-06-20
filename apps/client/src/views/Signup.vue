<script setup lang="ts">
import { z } from 'zod'
import { toFormValidator } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import type { UserForm } from '@/shared/interfaces'
import { createUser } from '@/shared/services/user.service'
import { useRouter } from 'vue-router'
import LayoutAccueil from '../components/LayoutAccueil.vue'

const REQUIRED_FIELD_MESSAGE = 'Ce champ est requis'
const router = useRouter()

const validationSchema = toFormValidator(z.object({
  firstName: z.string({ required_error: REQUIRED_FIELD_MESSAGE }).min(2, 'Ceci ne semble pas être un prénom'),
  lastName: z.string({ required_error: REQUIRED_FIELD_MESSAGE }).min(2, 'Ceci ne semble pas être un nom'),
  email: z.string({ required_error: REQUIRED_FIELD_MESSAGE }).email('Ceci semble être une adresse email invalide'),
  password: z.string({ required_error: REQUIRED_FIELD_MESSAGE }).min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
}))

const { handleSubmit } = useForm({
  validationSchema,
})

const submit = handleSubmit(async (formValue: UserForm) => {
  try {
    await createUser(formValue)
    await router.push('/sign_in')
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
    <div class="fr-container">
      <h2 class="mb-20">
        Inscription
      </h2>
      <div
        class="fr-container fr-grid-row"
        style="background: whitesmoke"
      >
        <div class="fr-col-3" />
        <div class="fr-col-5">
          <br>
          <form
            class="card"
            @submit="submit"
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

            <DsfrButton>
              Inscription
            </DsfrButton>
          </form>
          <br>
        </div>
        <div class="fr-col-3" />
      </div>
    </div>
  </LayoutAccueil>
</template>
