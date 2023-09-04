<script setup lang="ts">
import { onMounted, ref } from 'vue'
import apiClient from '../api/api-client'
import type { ErrorvalidateEmail } from '../api/ErrorValidEmail'

const props = defineProps<{ token: string }>()
const message = ref('Validation en cours...')
const status = ref(0)
onMounted(async () => {
  try {
    await apiClient.validEmail(props.token)
    message.value = 'Votre adresse courriel est validé.'
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
      <div
        class="fr-container fr-grid-row"
      >
        <div class="fr-col-1" />
        <div class="fr-col-10">
          <h5
            class="mb-20 fr-text-title--blue-france"
            style="text-align:center"
          >
            Confirmation votre inscription
          </h5>

          <h6 style="text-align:center">
            {{ message }}
          </h6>

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
      </div>
    </div>
  </LayoutAccueil>
</template>
