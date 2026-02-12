<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'

const props = withDefaults(defineProps<{
  isOpen: boolean
  file: { name: string; extension: string; url: string } | null
  loading?: boolean
}>(), {
  loading: false,
})

const emit = defineEmits(['close'])

const fileType = computed(() => {
  if (!props.file) {
    return null
  }
  const ext = props.file.extension.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    return 'image'
  }
  if (ext === 'pdf') {
    return 'pdf'
  }
  return 'fallback'
})

const handleDownload = () => {
  if (!props.file) {
    return
  }

  const link = document.createElement('a')
  link.href = props.file.url
  link.download = props.file.name
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onKeyStroke('Escape', (e) => {
  e.preventDefault()
  emit('close')
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="file-viewer-overlay"
        role="dialog"
        aria-modal="true"
        @click.self="emit('close')"
      >
        <div class="flex justify-between items-center fr-py-2w fr-px-4w viewer-header">
          <span class="fr-text--lg fr-m-0 font-bold">{{ loading ? 'Chargement...' : file?.name }}</span>
          <div class="flex items-center gap-4">
            <DsfrButton
              v-if="!loading"
              label="Télécharger"
              title="Télécharger"
              :icon="{ name: 'ri-download-line', fill: 'var(--grey-925-125)' }"
              icon-only
              tertiary
              no-outline
              @click="handleDownload"
            />

            <DsfrButton
              label="Fermer"
              title="Fermer"
              :icon="{ name: 'ri-close-line', fill: 'var(--grey-925-125)' }"
              icon-only
              tertiary
              no-outline
              @click="emit('close')"
            />
          </div>
        </div>

        <div class="flex flex-grow justify-center items-center overflow-hidden viewer-body">
          <div v-if="loading" class="loader-container">
            <VIcon
              name="ri-refresh-line"
              color="white"
              scale="4"
              animation="spin"
            />
            <p class="fr-mt-2w">
              Chargement du document...
            </p>
          </div>

          <template v-else-if="file">
            <template v-if="fileType === 'image'">
              <img
                :src="file.url"
                :alt="file?.name"
                class="content-fit"
              >
            </template>

            <template v-else-if="fileType === 'pdf'">
              <iframe
                :src="file.url"
                title="Visualisation PDF"
                class="content-full"
              />
            </template>

            <div v-else class="fallback-card">
              <i class="fr-icon-file-line fr-icon--lg" />
              <p>Aperçu non disponible pour ce format <strong>.{{ file.extension }}</strong></p>
              <DsfrButton
                label="Télécharger pour consulter"
                title="Télécharger"
                secondary
                @click="handleDownload"
              />
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.file-viewer-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  color: white;
}

.viewer-header {
  background-color: rgba(0, 0, 0, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.viewer-body {
  width: 80% !important;
  margin: 0 auto;
}

.content-fit {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
}

.content-full {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

.fallback-card {
  background: white;
  color: var(--grey-200-850);
  padding: 2rem;
  border-radius: 4px;
  text-align: center;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
}

.animate-spin {
  animation: spin 1s linear infinite;
  display: inline-block;
  font-size: 3rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
