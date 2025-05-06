<script setup lang="ts">
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import apiClient from '@/api/api-client'
import type { ICredentialsInput } from '@biblio-num/shared'
import LayoutAccueil from '@/components/Layout/LayoutAccueil.vue'
import { useUserStore } from '@/stores'
import ToggleInputPassword from '@/components/ToggleInputPassword.vue'
import { routeNames } from '@/router/route-names'
import useToaster from '@/composables/use-toaster'
import ProConnect from '@/components/ProConnect.vue'

const REQUIRED_FIELD_MESSAGE = 'Ce champ est requis'

const validationSchema = toTypedSchema(
  z.object({
    email: z
      .string({ required_error: REQUIRED_FIELD_MESSAGE })
      .email('Ceci semble être une adresse email invalide'),
    password: z
      .string({ required_error: REQUIRED_FIELD_MESSAGE })
      .min(import.meta.env.PROD ? 15 : 8, 'Le mot de passe doit contenir au moins 15 caractères'),
  }),
)

const { handleSubmit, setErrors } = useForm<{ email: string; password: string }>({
  validationSchema,
})

const toaster = useToaster()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const proConnectUrl = ref<string>()

onMounted(async () => {
  try {
    const { url } = await apiClient.loginWithProconnect()
    proConnectUrl.value = url
  } catch {
    if (import.meta.env.DEV) {
      console.log('Pas de ProConnect disponible')
    }
  }
})

const submit = handleSubmit(async (formValue: ICredentialsInput) => {
  toaster.removeMessage('auth')
  const response = await userStore.login(formValue)

  if ('error' in response) {
    const error = response.error

    if (error.response?.status === 429) {
      toaster.addErrorMessage('Suite à de nombreuses tentatives échouées, votre compte a été temporairement bloqué. Un courriel vous a été envoyé.')
      return
    }

    if (error.response?.status === 423) {
      toaster.addSuccessMessage('Un courriel vous a été envoyé. Veuillez vérifier votre boîte de réception et suivre les instructions pour vous connecter.')
      return
    }

    setErrors({
      password:
        'Votre courriel ou votre mot passe est incorrect. Vous pouvez réessayer ou réinitialiser votre mot de passe.',
    })
    return
  }

  if (response?.message) {
    toaster.addErrorMessage(response.message)
    return
  }

  if (route.query.redirect) {
    router.push(route.query.redirect as string)
    return
  }

  router.push({ name: routeNames.DEFAULT })
})

const { value: emailValue, errorMessage: emailError } = useField<string>('email')
const { value: passwordValue, errorMessage: passwordError } = useField<string>('password')
</script>

<template>
  <LayoutAccueil>
    <div class="fr-container">
      <div class="fr-container fr-grid-row">
        <div class="fr-col-1" />
        <div class="fr-col-10">
          <h5
            class="mb-20 fr-text-title--blue-france"
            style="text-align:center"
          >
            Connectez-vous avec vos identifiants Bibliothèque numérique
          </h5>

          <form class="card" @submit.prevent="submit">
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

            <div
              class="fr-m-4w"
              style="text-align:center"
            >
              <DsfrButton type="submit">
                Se connecter
              </DsfrButton>

              <div
                style="text-align:center; margin-top: 15px"
              >
                <router-link :to="{ name: 'SignUp' }">
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
            </div>
          </form>
          <div v-if="proConnectUrl" class="separator">
            <hr>
            <span class="separator-or">ou</span>
            <hr>
          </div>
          <div class="flex justify-center">
            <ProConnect
              v-if="proConnectUrl"
              :url="proConnectUrl"
            />
          </div>
        </div>
        <div class="fr-col-1" />
      </div>
    </div>
  </LayoutAccueil>
</template>

<style scoped>
.separator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
  margin-bottom: 0px;
  gap: 0.5rem;

}

.separator hr {
  flex: 1;
  margin: 0;
  border: 0;
  border-top: 1px solid #ccc;
}

.separator-or {
  margin-bottom: 16px;
  font-weight: bold;
  color: #999;
}
</style>
