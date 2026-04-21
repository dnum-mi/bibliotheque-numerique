<script lang="ts" setup>
import { computed, ref } from 'vue'
import useToaster from '../composables/use-toaster'
import type { VIconProps } from '@gouvminint/vue-dsfr'

const props = withDefaults(defineProps<{
  disabled?: boolean
  label?: string
  onDownload: () => Promise<void>
  size?: 'sm' | 'small' | 'lg' | 'large' | 'md' | 'medium' | '' | undefined
  tertiary?: boolean
  secondary?: boolean
}>(), {
  disabled: false,
  label: 'Télécharger',
  size: 'sm',
  tertiary: true,
  secondary: false,
})
const toaster = useToaster()
const isDownloading = ref(false)
const isDisabled = computed(() => props.disabled || isDownloading.value)

const handleDownloadSelected = async () => {
  if (isDownloading.value) {
    return
  }

  isDownloading.value = true
  const msgId = toaster.addSuccessMessage('Téléchargement en cours')

  try {
    await props.onDownload()
  } finally {
    isDownloading.value = false
  }
  toaster.removeMessage(msgId)
  toaster.addSuccessMessage('Téléchargement Fini')
}

const icon = computed(() => isDownloading.value ? { name: 'ri-refresh-line', animation: 'spin' } as VIconProps : 'fr-icon-download-line')
const newLabel = computed(() => isDownloading.value ? 'Téléchargement...' : props.label)
</script>

<template>
  <DsfrButton
    :icon="icon"
    :label="newLabel"
    :tertiary
    :secondary
    :size="size"
    :disabled="isDisabled"
    @click="handleDownloadSelected"
  />
</template>
