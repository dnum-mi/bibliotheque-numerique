<script setup lang="ts">
import apiClient from '@/api/api-client'

const props = defineProps<{
  userId: number | null
}>()

const generatedLink = ref<string>('')
const expirationTime = ref<string>('')
const isLoading = ref(false)
const error = ref<{ title: string; description: string } | null>(null)
const isCopied = ref(false)
const modal = ref(false)

const btnIcon = computed(() => {
  return !isLoading.value
    ? 'fr-icon-lock-line'
    : { name: 'ri-loader-4-line', animation: 'spin' as const }
})

const generateAndShowModal = async () => {
  isLoading.value = true
  isCopied.value = false

  if (!props.userId) {
    isLoading.value = false
    return
  }

  try {
    const response = await apiClient.generateUpdatePasswordLink(props.userId)
    generatedLink.value = response.link
    expirationTime.value = response.duration
    modal.value = true
  } catch {
    error.value = {
      title: 'Erreur lors de la génération du lien',
      description: 'Une erreur est survenue lors de la génération du lien. Veuillez réessayer plus tard.',
    }
  } finally {
    isLoading.value = false
  }
}

const copyLinkToClipboard = () => {
  if (!generatedLink.value) {
    return
  }

  try {
    navigator.clipboard.writeText(generatedLink.value)
    isCopied.value = true

    setTimeout(() => {
      isCopied.value = false
    }, 3000)
  } catch {
    error.value = {
      title: 'Erreur lors de la copie',
      description: 'Une erreur est survenue lors de la copie du lien. Veuillez copier le lien manuellement.',
    }
  }
}

const closeModal = () => {
  modal.value = false
  generatedLink.value = ''
  isCopied.value = false
}
</script>

<template>
  <div>
    <DsfrButton
      :icon="btnIcon"
      title="Générer un lien de validation de compte et mise à jour de mot de passe"
      no-outline
      tertiary
      icon-only
      @click="generateAndShowModal"
    />

    <DsfrAlert
      v-if="error"
      :title="error.title"
      :description="error.description"
      type="info"
      class="mb-6"
    />

    <DsfrModal
      :opened="modal"
      title="Lien de validation de compte et mise à jour de mot de passe"
      @close="closeModal"
    >
      <p>Copiez le lien ci-dessous pour le partager. Ce lien est unique et valable pendant {{ expirationTime }}.</p>

      <DsfrInputGroup class="flex items-center">
        <DsfrInput
          v-model="generatedLink"
          type="text"
          label="Lien généré"
          :label-visible="false"
          placeholder="Le lien apparaîtra ici"
          readonly
        />
        <DsfrButton
          title="Copier le lien"
          icon="ri-file-copy-line"
          tertiary
          no-outline
          icon-only
          @click="copyLinkToClipboard"
        />
        <p
          v-if="isCopied"
          class="fr-valid-text fr-mt-2v"
        >
          Lien copié dans le presse-papiers !
        </p>
      </DsfrInputGroup>
    </DsfrModal>
  </div>
</template>

<style scoped>
.fr-valid-text {
  color: var(--text-success-colour);
}
</style>
