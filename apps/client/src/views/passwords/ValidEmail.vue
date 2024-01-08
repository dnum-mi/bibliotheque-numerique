<script setup lang="ts">
import apiClient from '../../api/api-client'
import type { ErrorvalidateEmail } from '../../api/ErrorValidEmail'

const props = defineProps<{ token: string }>()
const message = ref('Validation en cours...')
const status = ref(0)
onMounted(async () => {
  try {
    await apiClient.validEmail(props.token)
    message.value = 'Votre adresse courriel est validée.'
    status.value = 0
  } catch (error) {
    message.value = (error as Error).message
    status.value = (error as ErrorvalidateEmail).status || 0
  }
})
</script>
<template>
  <LayoutAccueil>
    <div class="fr-container fr-m-5w">
      <h5
        class="fr-text-title--blue-france"
        style="text-align:center"
      >
        Confirmation de votre inscription
      </h5>

      <p style="text-align:center">
        {{ message }}
      </p>

      <div
        v-if="status === 0"
        style="text-align:center"
      >
        <router-link
          to="/sign_in"
          class="fr-btn"
        >
          Se connecter
        </router-link>
      </div>

      <div v-if="status === 1 || status === 409">
        <p
          class="fr-text--lead  fr-mb-3w"
          style="text-align:center"
        >
          Vous pouvez vous connecter.
        </p>

        <ul
          class="fr-btns-group  fr-btns-group--inline-md"
          style="justify-content:center"
        >
          <li>
            <RouterLink
              class="fr-btn"
              to="/"
            >
              Se connecter
            </RouterLink>
          </li>
        </ul>
        <div
          class="fr-m-4w"
          style="text-align:center"
        >
          <router-link :to="{ name: 'ResetPassword' }">
            Mot de passe oublié ?
          </router-link>
        </div>
      </div>
    </div>
  </LayoutAccueil>
</template>
