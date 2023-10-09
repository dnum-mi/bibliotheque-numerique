<script setup lang="ts">
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import { useRouter } from 'vue-router'

import type { CredentialsInputDto } from '@biblio-num/shared'
import LayoutAccueil from '@/components/Layout/LayoutAccueil.vue'
import { useUserStore } from '@/stores'
import ToggleInputPassword from '@/components/ToggleInputPassword.vue'
import PasswordHint from '@/components/PasswordHint.vue'
import { passwordValidator } from '@/utils/password.validator'

const REQUIRED_FIELD_MESSAGE = 'Ce champ est requis'

const router = useRouter()
const userStore = useUserStore()

const validationSchema = toTypedSchema(z.object({
  email: z.string({ required_error: REQUIRED_FIELD_MESSAGE })
    .email('Ceci semble être une adresse email invalide'),
  password: import.meta.env.PROD ? passwordValidator : z.string({ required_error: REQUIRED_FIELD_MESSAGE }).min(8, 'Le mot de passe doit contenir au moins 15 caractères'),
}))

const { handleSubmit, setErrors } = useForm<{ email: string, password: string }>({
  validationSchema,
})

const submit = handleSubmit(async (formValue: CredentialsInputDto) => {
  try {
    await userStore.login(formValue)
    router.push('/demarches')
  } catch (e) {
    setErrors({ password: 'Adresse électronique ou mot de passe incorrectes !' })
  }
})

const { value: emailValue, errorMessage: emailError } = useField<string>('email')
const { value: passwordValue, errorMessage: passwordError } = useField<string>('password')

</script>

<template>
  <LayoutAccueil>
    <div class="fr-container">
      <div
        class="fr-container fr-grid-row"
      >
        <div class="fr-col-1" />
        <div class="fr-col-10">
          <h5
            class="mb-20 fr-text-title--blue-france"
            style="text-align:center"
          >
            Connectez-vous avec vos identifiants Bibliothèque numérique
          </h5>
          <form
            class="card"
            @submit.prevent="submit"
          >
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

            <ToggleInputPassword
              id="password"
              v-model="passwordValue"
              :password-error="passwordError"
              label="Saisir votre mot de passe"
            />
            <PasswordHint
              :password="passwordValue"
            />

            <div
              class="fr-m-4w"
              style="text-align:center"
            >
              <DsfrButton type="submit">
                Se connecter
              </DsfrButton>
            </div>

            <div
              class="fr-m-4w"
              style="text-align:center"
            >
              <router-link :to="{name: 'SignUp'}">
                Pas encore inscrit ? Inscrivez-vous ici.
              </router-link>
            </div>

            <div
              class="fr-m-4w"
              style="text-align:center"
            >
              <router-link :to="{ name: 'ResetPassword' }">
                Mot de passe oublié ?
              </router-link>
            </div>
          </form>
        </div>
        <div class="fr-col-1" />
      </div>
    </div>
  </LayoutAccueil>
</template>
