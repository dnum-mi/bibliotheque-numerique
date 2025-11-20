<script setup lang="ts">
import apiClient from '@/api/api-client'

import AppToaster from '@/components/AppToaster.vue'
import useToaster from '@/composables/use-toaster.js'

import type { EnvTextKeys } from '@/shared/types'
import { defaultEnv, envTextMapping } from '@/shared/types'
import { logInServer } from '@/utils/log.utils'
import { AxiosError } from 'axios'
import { useNavigation } from './composables/navigation'

const version = ref('0.0.0')
const runEnv = ref<EnvTextKeys>(defaultEnv)
const toaster = useToaster()

onMounted(async () => {
  try {
    const healthJson = await apiClient.getHealth()
    version.value = healthJson.info?.version.version
    runEnv.value = healthJson.info?.environment.environment
  } catch {
    toaster.addErrorMessage({ description: 'une erreur est survenue à la déconnexion' })
  }
})

const envStyle = computed(() => `env_${runEnv.value}`)
const serviceTitle = 'Bibliothèque Numérique'
const serviceDescription = 'Rechercher une démarche, un dossier, un organisme'
const logoText = ['Ministère', 'de l’intérieur']
const ecosystemLinks = [
  { label: 'Demarches.numerique.gouv.fr', href: 'https://demarches.numerique.gouv.fr', title: 'Démarches, ouvre une nouvelle fenêtre' },
  { label: 'API - Répertoire National des Associations', href: 'https://entreprise.api.gouv.fr/catalogue/ministere_interieur/rna', title: 'Référentiel des associations, ouvre une nouvelle fenêtre' },
  {
    label: 'Intranet DLPAJ',
    href: 'https://intranet.dlpaj.minint.fr/index.php/associations-et-fondations/systeme-d-information-des-associations-et-fondations-siaf',
    title: 'Intranet DLPAJ, ouvre une nouvelle fenêtre',
  },
  // { label: 'Répertoire National des Fondations', href: 'https://rnf.interieur.rie.gouv.fr' },
  // { label: 'Cloud π Native', href: 'https://cloud-pi-native.fr/' },
]
const mandatoryLinks = [
  { label: 'Accessibilité : non conforme', to: '/accessibility' },
  { label: 'Gestion des cookies', to: '/cookies' },
]

const { quickLinks } = useNavigation()

const searchQuery = ref('')

onErrorCaptured((error: Error | AxiosError) => {
  if (import.meta.env.PROD) {
    logInServer(error.stack, 'error')
  }
  if (error instanceof AxiosError) {
    if (error?.response && error?.response?.status) {
      const status = error.response.status
      const errorMessages = {
        400: 'Requête invalide. Veuillez vérifier vos données.',
        401: 'Vous n’êtes plus connecté. Veuillez vous connecter pour accéder à cette ressource.',
        403: 'Accès refusé. Vous n’avez pas les permissions nécessaires.',
        404: 'Ressource non trouvée.',
        500: 'Erreur interne du serveur. Veuillez contacter votre administrateur.',
      } as const
      const errorMessage = errorMessages[status as keyof typeof errorMessages] || 'Erreur inconnue. Veuillez réessayer.'
      toaster.addErrorMessage({ description: errorMessage })
      if (import.meta.env.DEV) {
        console.error(`Erreur HTTP [${status}]: ${errorMessage}`)
      }
    }
  } else {
    toaster.addErrorMessage({ description: error instanceof Error ? error.message : error })
    if (import.meta.env.DEV) {
      console.error('Erreur inattendue:', error)
    }
  }
  return false
})
</script>

<template>
  <div class="flex flex-col h-full w-full">
    <DsfrHeader
      v-model="searchQuery"
      :service-title
      :logo-text
      :quick-links
      :service-description
    />

    <main class="flex flex-col grow w-full h-full min-h-0 overflow-auto">
      <router-view />
    </main>

    <AppDsfrFooter
      a11y-compliance="partiellement conforme"
      :mandatory-links
      :class="envStyle"
      :logo-text
      :ecosystem-links
      licence-text=""
    >
      <template #description>
        <div class="flex gap-2 justify-end">
          Environnement: <strong>{{ envTextMapping[runEnv] }}</strong> /
          <strong>v{{ version }}</strong>
        </div>
      </template>
    </AppDsfrFooter>
  </div>

  <AppToaster
    :messages="toaster.messages"
    @close-message="toaster.removeMessage($event)"
  />
</template>

<style>
.p-datatable-tbody {
  --p-datatable-row-hover-background: var(--blue-france-925-125);
}

.p-datatable {
  --p-datatable-header-cell-selected-background: var(--blue-france-925-125);
  --p-datatable-header-cell-selected-color: var(--blue-france-sun-113-625);
}
</style>

<style scoped>
#app {
  height: 100% !important;
  display: flex;
  flex-direction: column;
}

.raised-top-shadow {
  background-color: var(--background-raised-grey);
  filter: drop-shadow(0 -3px 5px var(--shadow-color));
}

.env_development {
  color: white !important;
  background-color: rgba(2, 117, 0, 0.42);
}

.env_staging {
  color: white !important;
  background-color: #006165;
}

.env_preproduction {
  color: white !important;
  background-color: rgba(124, 0, 131, 0.61);
}

@media screen and (max-width: 1400px) {
  :deep(.fr-header__tools-links .fr-btn) {
    padding: 0.25rem !important;
  }
}

@media screen and (max-width: 1250px) {
  :deep(.fr-header__tools-links .fr-btn) {
    font-size: 0.75rem !important;
  }
}

@media screen and (max-width: 1120px) {
  :deep(.fr-header__tools-links .fr-btn) {
    width: 30px !important;
    height: 30px !important;
    overflow: hidden !important;
  }
}

@media screen and (max-height: 780px) {
  body {
    font-size: 1rem !important;
  }

  :deep(.fr-header__body-row) {
    padding: 0.5em 0 !important;
  }

  :deep(.fr-header__service-title) {
    font-size: 14px !important;
  }
  :deep(.fr-header__service-title) {
    font-size: 14px !important;
  }
  :deep(.fr-header__service-tagline) {
    display: none;
  }
  :deep(.fr-logo::after) {
    display: none !important;
  }
}
</style>
