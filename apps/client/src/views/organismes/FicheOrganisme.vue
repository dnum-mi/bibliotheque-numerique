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

const props = defineProps<{
  organismeId: string
  organismeType: organismeCategoryKey
}>()

const organismeHubStore = useOrganismeHubStore()

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
  if (!organisme.value || props.organismeType !== EOrganismeCategory.association) {
    return null
  }
  return organisme.value as IAssociationOutput
})

const loadIfNeeded = async () => {
  if (organisme.value) {
    return
  }

  isLoading.value = true
  hasError.value = false

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

  isLoading.value = false
}

onMounted(() => {
  void loadIfNeeded()
})
</script>

<template>
  <div>
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
        Impossible de charger la fiche pour cet organisme.
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
