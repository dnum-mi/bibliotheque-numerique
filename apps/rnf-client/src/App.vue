<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { ref, watch, computed } from 'vue'

import useToaster from '@/composables/use-toaster.js'

import AppToaster from '@/components/AppToaster.vue'
import ReloadPrompt from '@/components/ReloadPrompt.vue'
import { MAIN_TITLE } from './config.js'

import useRnfClient from './composables/use-rnf-client.js'

const serviceTitle = 'RNF'
const serviceDescription = MAIN_TITLE
const logoText = ['Ministère', 'de l’intérieur', 'et des outre-mer']

const {
  offlineReady,
  needRefresh,
  updateServiceWorker,
} = useRegisterSW()

const dossierId = ref('')
const lastSuccessfulDossierId = ref('')
const dossierInputLabel = 'Veuillez indiquer un numéro de dossier'
const dossierInputPlaceholder = '456735'

const isInputTouched = ref(false)
const errorMessage = ref('')

const close = () => {
  offlineReady.value = false
  needRefresh.value = false
}

const rnfClient = useRnfClient()
watch([dossierId, rnfClient.errorMessage], ([newDossierId, newErrorMessage]) => {
  if (newDossierId !== '' && (!isInputTouched.value || rnfClient.requesting.value)) {
    errorMessage.value = ''
  }
  errorMessage.value = checkInput(newDossierId)
  return newErrorMessage || checkInput(dossierId.value)
})

const rnfId = computed(() => rnfClient.rnfId.value)

function checkInput (dossierId: string) {
  if (dossierId === '') {
    return 'Veuillez remplir le champ de saisie du numéro de dossier'
  }
  if (!/^\d+$/.test(dossierId)) {
    return 'Veuillez remplir avec des chiffres uniquement'
  }
  return ''
}

const toaster = useToaster()
async function getRnfId(dossierId: string) {
  await rnfClient.getRnfId(+dossierId)
  const inputError = rnfClient.errorMessage.value
  if (rnfClient.errorMessage.value !== '') {
    toaster.addMessage({ description: inputError, type: 'error', title: 'Impossible de récupérer l’identifiant RNF', timeout: 5000})
    return
  }
  lastSuccessfulDossierId.value = dossierId
}
</script>

<template>
  <DsfrHeader
    :service-title="serviceTitle"
    :service-description="serviceDescription"
    :logo-text="logoText"
  />
  <div class="fr-container h-[250px]">
    <div class="h-full">
      <form  class="rnf-request" @submit.prevent="getRnfId(dossierId)">
        <div>
          <p>
            <DsfrInputGroup
              v-model="dossierId"
              autofocus
              :error-message="errorMessage"
              type="text"
              :label="dossierInputLabel"
              label-visible
              :placeholder="dossierInputPlaceholder"
              @blur="isInputTouched = true"
            />
          </p>
          <p class="text-center">
            <DsfrButton
              type="submit"
              label="Envoyer"
            />
          </p>
        </div>
      </form>
      <div class="text-center">
        <p v-if="rnfClient.requesting.value">
          Requête en cours, veuillez patienter...
        </p>
        <p v-if="rnfClient.rnfId.value !== ''">
          Le numéro RNF correspondant au dossier <code>{{ lastSuccessfulDossierId }}</code> est le <pre> {{ rnfId  }} </pre>
        </p>
      </div>

    </div>
  </div>

  <AppToaster
    :messages="toaster.messages"
    @close-message="toaster.removeMessage($event)"
  />

  <ReloadPrompt
    :offline-ready="offlineReady"
    :need-refresh="needRefresh"
    @close="close()"
    @update-service-worker="updateServiceWorker()"
  />
</template>

<style scoped>
.rnf-request {
  display: flex;
  height: 100%;
  justify-content: center;
  margin-top: 4rem;
}

.text-center {
  text-align: center;
}

.h-\[250px\] {
  height: 250px;
}
</style>
