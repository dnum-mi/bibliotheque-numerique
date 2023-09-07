<script setup lang="ts">
import { z } from 'zod'
import { toFormValidator } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import type { CredentialsInputDto } from '@biblio-num/shared'
import LayoutAccueil from '../components/LayoutAccueil.vue'

const REQUIRED_FIELD_MESSAGE = 'Ce champ est requis'

const router = useRouter()
const userStore = useUserStore()
const tmpType = ref('password')
const tmpTitle = computed(() => (tmpType.value === 'password' ? 'Afficher le mot de passe' : 'Masquer le mot de passe'))
const eyeIcon = computed(() => (tmpType.value === 'password' ? 'fr-icon-eye-fill' : 'fr-icon-eye-off-fill'))

const togglePassword = () => {
  tmpType.value = tmpType.value === 'password' ? 'text' : 'password'
}

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
    setErrors({ password: 'Adresse électronique ou mot de passe incorrectes !' })
  }
})

const { value: emailValue, errorMessage: emailError } = useField('email')
const { value: passwordValue, errorMessage: passwordError } = useField('password')

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
              <div class="relative">
                <DsfrInput
                  id="password"
                  v-model="passwordValue"
                  :type="tmpType"
                  label="Mot de passe (6 caractères minimum)"
                  label-visible
                  placeholder="xxxxxx"
                  required
                >
                  <template #required-tip>
                    <em class="required-label"> *</em>
                  </template>
                </DsfrInput>
                <div class="absolute  right-2  top-[55%]">
                  <Vicon
                    :class="eyeIcon"
                    :name="eyeIcon"
                    scale="1.25"
                    :title="tmpTitle"
                    @click.prevent="togglePassword"
                  />
                </div>
              </div>
            </DsfrInputGroup>

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
  </layoutaccueil>
</template>
