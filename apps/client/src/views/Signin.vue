<script setup lang="ts">
import { z } from 'zod'
import { toFormValidator } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import type { LoginForm } from '@/shared/interfaces'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'

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

const submit = handleSubmit(async (formValue: LoginForm) => {
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
  <div class="fr-container">
    <h2 class="mb-20">
      Connectez-vous
    </h2>
    <div
      class="fr-container fr-grid-row"
      style="background: whitesmoke"
    >
      <div class="fr-col-12">
        <br>
      </div>
      <div class="fr-col-sm-1" />
      <div class="fr-col-sm-4">
        <div class="fr-" />
        <!-- TODO: Faire autrement que ces <br> -->
        <br>
        <br>
        <br>
        <DsfrFranceConnect
          :secure="secure"
        />
      </div>
      <div
        class="fr-col-sm-2"
        style="text-align: center"
      >
        <!-- TODO: Faire autrement que ces <br> -->
        <br>
        <br>
        <br>
        <br>
      </div>
      <div class="fr-col-sm-4">
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

          <DsfrButton type="submit">
            Se connecter
          </DsfrButton>
        </form>
      </div>
      <div class="fr-col-sm-1" />
      <div class="fr-col-12">
        <br>
      </div>
    </div>
  </div>
</template>
