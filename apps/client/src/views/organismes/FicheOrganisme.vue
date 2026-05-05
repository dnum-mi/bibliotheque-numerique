<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { EOrganismeCategory } from '@biblio-num/shared'
import type {
  IFoundationOutput,
  IAssociationOutput,
  organismeCategoryKey,
} from '@biblio-num/shared'
import FicheFondation from '@/views/organismes/fondation/FicheFondation.vue'
import FicheAssociation from '@/views/organismes/association/FicheAssociation.vue'
import apiClient from '@/api/api-client'
import { useOrganismeHubStore } from '@/stores/organisme-hub.ts'
import useToaster from '../../composables/use-toaster'
import { usePageTitle } from '@/composables/use-page-title'
import { useConfiguration } from '@/composables/use-configuration'

const props = defineProps<{
  organismeId: string
  organismeType: organismeCategoryKey
}>()

const organismeHubStore = useOrganismeHubStore()
const { isAssociationsEnabled } = useConfiguration()

const router = useRouter()
const toaster = useToaster()

const isLoading = ref(false)
const hasError = ref(false)

// On regarde si l'organisme demandé est déjà dans le store
const organisme = computed(() => {
  const current = organismeHubStore.currentOrganisme
  if (!current) {
    return null
  }
  return current.id === props.organismeId ? current : null
})

const fondation = computed<IFoundationOutput | null>(() => {
  if (!organisme.value || props.organismeType !== EOrganismeCategory.fondation) {
    return null
  }
  return organisme.value as IFoundationOutput
})

const association = computed<IAssociationOutput | null>(() => {
  if (!isAssociationsEnabled.value || props.organismeType !== EOrganismeCategory.association || !organisme.value) {
    return null
  }
  return organisme.value as IAssociationOutput
})

const errorMessage = computed(() => {
  if (!isAssociationsEnabled.value && props.organismeType === EOrganismeCategory.association) {
    return 'La consultation des associations n\'est pas disponible pour le moment.'
  }
  return `Impossible de charger la fiche pour cet organisme (${props.organismeId}).`
})

const loadIfNeeded = async () => {
  isLoading.value = true
  hasError.value = false

  try {
    if (!isAssociationsEnabled.value && props.organismeType === EOrganismeCategory.association) {
      toaster.addErrorMessage(errorMessage.value)
      await router.replace({ path: '/organismes' })
      return
    }

    if (organisme.value) {
      return
    }

    if (props.organismeType === EOrganismeCategory.fondation) {
      const fondation = await apiClient.hubGetRnf(props.organismeId)
      if (!fondation) {
        hasError.value = true
      }
      organismeHubStore.setOrganisme(fondation, EOrganismeCategory.fondation)
    } else {
      const asso = await apiClient.hubGetRna(props.organismeId)
      if (!asso) {
        hasError.value = true
      }
      organismeHubStore.setOrganisme(asso, EOrganismeCategory.association)
    }
  } catch (e) {
    console.error('❌ [DEBUG] ERREUR CAPTURÉE DANS LE CATCH :', e)
    toaster.addErrorMessage(errorMessage.value)
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadIfNeeded()
})

const pageTitle = computed(() => {
  let rawTitle = 'Fiche organisme'

  if (isLoading.value) {
    rawTitle = 'Chargement de la fiche...'
  } else if (hasError.value) {
    rawTitle = 'Erreur de chargement'
  } else if (organisme.value) {
    const orgaTitle = organisme.value.title || 'Organisme'
    rawTitle = `${orgaTitle} (${organisme.value.id})`
  }

  return rawTitle
})

usePageTitle(pageTitle)
</script>

<template>
  <div class="h-full">
    <div
      v-if="isLoading"
      class="fr-my-4w py-8 text-center"
    >
      <p class="fr-text--md">
        Chargement de la fiche organisme...
      </p>
    </div>

    <div
      v-else-if="hasError"
      class="fr-my-4w py-8 text-center"
    >
      <p class="fr-text--md">
        {{ errorMessage }}
      </p>
    </div>

    <template v-else>
      <FicheFondation
        v-if="fondation"
        :foundation="fondation"
      />
      <FicheAssociation
        v-if="association"
        :association
      />
    </template>
  </div>
</template>

<style scoped></style>
