<script lang="ts" setup>
import { eState } from '@biblio-num/shared'
import { dateToStringFr } from '@/utils'
import apiClient from '@/api/api-client'
import type { TSyncState } from '../shared/types'

const props = defineProps<{
  syncState: TSyncState,
}>()

const emit = defineEmits(['refresh-sync', 'refresh-data'])

const state = ref<TSyncState>(props.syncState)
const isUploading = computed(() => (props.syncState?.state === eState.uploaded || props.syncState?.state === eState.failed))
const disabled = ref(!isUploading.value)

const onClick = async () => {
  disabled.value = true
  emit('refresh-sync')
  await polling()
}

let timeoutId: NodeJS.Timeout
const polling = async () => {
  timeoutId = setTimeout(async () => {
    if (!state.value) {
      return
    }
    const resltut = await apiClient.getSyncStateById(state.value.id)
    state.value = resltut as TSyncState

    if (state.value?.state === eState.uploaded || state.value?.state === eState.failed) {
      disabled.value = false
      emit('refresh-data')
      return
    }

    polling()
  }, 1000)
}

onMounted(async () => {
  if (!isUploading.value && !timeoutId) {
    await polling()
  }
})

onBeforeUnmount(() => {
  if (timeoutId) { clearTimeout(timeoutId) }
})
</script>

<template>
  <div v-if="state" class="flex flex-row gap-4 justify-center items-center">
    <div>
      <DsfrButton
        size="lg"
        label="Actualiser"
        :icon="disabled ? { name: 'ri-refresh-line', animation: 'spin' } : 'fr-icon-refresh-fill'"
        icon-only
        :disabled="disabled"
        @click="onClick()"
      />
    </div>
    <span v-if="disabled" class="fr-text--sm m-0!"> En cours d'actulisation </span>
    <span v-else class="fr-text--sm m-0!"> Actulisé le {{ dateToStringFr(state.lastSynchronisedAt) }}</span>
  </div>
</template>
