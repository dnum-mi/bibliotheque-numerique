<script setup lang="ts">
import { z } from 'zod'
import { toFormValidator } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import type { CredentialsInputDto } from '@biblio-num/shared'
import LayoutAccueil from '../components/LayoutAccueil.vue'

const REQUIRED_FIELD_MESSAGE = 'Ce champ est requis'

const router = useRouter()
const userStore = useUserStore()

const secure = ref()

const validationSchema = toFormValidator(z.object({
  email: z.string({ required_error: REQUIRED_FIELD_MESSAGE }).email('Ceci semble être une adresse email invalide'),
  password: z.string({ required_error: REQUIRED_FIELD_MESSAGE }).min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
}))

const { handleSubmit, setErrors } = useForm<{ email: string, password: string }>({
  validationSchema,
})

const submit = handleSubmit(async (formValue: CredentialsInputDto) => {
  try {
    await userStore.login(formValue)
    router.push('/demarches')
  } catch (e) {
    setErrors({ password: e as string })
  }
})

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
            Connectez-vous avec vos identifiants Bibliothèque numérique
          </h5>
          <form
            class="card"
            @submit="submit"
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

            <DsfrInputGroup
              :is-valid="passwordError"
              :error-message="passwordError"
            >
              <DsfrInput
                id="password"
                v-model="passwordValue"
                label="Mot de passe (6 caractères minimum)"
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
              <DsfrButton type="submit">
                Se connecter
              </DsfrButton>
            </div>
          </form>
        </div>
        <div class="fr-col-1" />
      </div>
    </div>
  </layoutaccueil>
</template>
