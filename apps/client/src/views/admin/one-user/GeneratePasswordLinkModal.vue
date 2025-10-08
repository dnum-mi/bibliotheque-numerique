<script setup lang="ts">
import apiClient from '@/api/api-client'

const props = defineProps<{
  userId: number | null
  email: string | null
}>()

type ModalState = 'confirming' | 'loading' | 'generated' | 'error'
const modalState = ref<ModalState>('confirming')
const generatedLink = ref<string>('')
const expirationTime = ref<string>('')
const error = ref<{ title: string; description: string } | null>(null)
const isCopied = ref(false)
const modal = ref(false)

const modalTitle = computed(() => {
  switch (modalState.value) {
    case 'confirming':
      return 'Confirmer la génération du lien'
    case 'loading':
      return 'Génération en cours...'
    case 'generated':
      return 'Lien généré avec succès'
    case 'error':
      return 'Erreur lors de la génération du lien'
    default:
      return ''
  }
})

const resetState = () => {
  modalState.value = 'confirming'
  generatedLink.value = ''
  expirationTime.value = ''
  error.value = null
  isCopied.value = false
}

const openModal = () => {
  resetState()
  modal.value = true
}

const closeModal = () => {
  resetState()
  modal.value = false
}

const generateLink = async () => {
  if (!props.userId) {
    error.value = {
      title: 'ID utilisateur manquant',
      description: 'L\'ID utilisateur est requis pour générer le lien.',
    }
    modalState.value = 'error'
    return
  }
  modalState.value = 'loading'
  isCopied.value = false

  try {
    const response = await apiClient.generateUpdatePasswordLink(props.userId!)
    generatedLink.value = response.link
    expirationTime.value = response.duration
    modalState.value = 'generated'
  } catch {
    error.value = {
      title: 'Échec de la génération',
      description: 'Nous n\'avons pas pu générer le lien. Veuillez réessayer.',
    }
    modalState.value = 'error'
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
    console.error('Échec de la copie dans le presse-papiers')
  }
}
</script>

<template>
  <div>
    <DsfrButton
      icon="fr-icon-feedback-line"
      title="Générer un lien de validation de compte et mise à jour de mot de passe"
      no-outline
      tertiary
      icon-only
      :disabled="!userId"
      @click="openModal"
    />

    <DsfrModal
      :opened="modal"
      :title="modalTitle"
      @close="closeModal"
    >
      <div v-if="modalState === 'confirming'">
        <DsfrCallout
          icon="ri-information-fill"
        >
          <p>Vous allez générer un lien unique pour permettre à l'utilisateur <strong>{{ email }}</strong> de <strong>valider son compte</strong> ou de <strong>réinitialiser son mot de passe</strong>.</p>
          <p><strong>Attention :</strong> N'utilisez cette fonction que si l'utilisateur a formellement prouvé son identité et que l'accès à sa boîte mail est impossible. Le lien généré doit être transmis au demandeur.</p>
        </DsfrCallout>
        <p class="fr-mt-4v">
          Voulez-vous continuer ?
        </p>
        <DsfrButtonGroup
          :inline-layout-when="true"
          class="fr-mt-4w"
        >
          <DsfrButton
            label="Générer"
            size="sm"
            @click="generateLink"
          />
          <DsfrButton
            label="Annuler"
            size="sm"
            secondary
            @click="closeModal"
          />
        </DsfrButtonGroup>
      </div>

      <div v-else-if="modalState === 'loading'">
        <p>Génération du lien en cours...</p>
        <div class="fr-upload-group" />
      </div>

      <div v-else-if="modalState === 'generated'">
        <p>
          Le lien a été généré avec succès. Transmettez-le au demandeur.
          Il restera valide pendant <strong>{{ expirationTime }}</strong>.
        </p>

        <DsfrInputGroup class="fr-mt-2w">
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
            class="fr-valid-text fr-mt-1w"
          >
            Lien copié dans le presse-papiers !
          </p>
        </DsfrInputGroup>
      </div>

      <div v-else-if="modalState === 'error'">
        <DsfrAlert
          type="error"
          :title="error?.title || 'Erreur'"
          :description="error?.description || 'Une erreur est survenue.'"
          :closeable="false"
          class="fr-mb-2w"
        />
        <DsfrButton
          label="Réessayer"
          icon="ri-refresh-line"
          @click="generateLink"
        />
      </div>
    </DsfrModal>
  </div>
</template>
