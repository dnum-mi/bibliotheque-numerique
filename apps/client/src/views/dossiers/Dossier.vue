<script lang="ts" setup>
import type { Message as DossierMessage } from '@dnum-mi/ds-api-client'
import type { IDossierFieldsOutput, IFileOutput, IPagination } from '@biblio-num/shared'

import { useDossierStore } from '@/stores/dossier'
import LayoutFiche from '@/components/Layout/LayoutFiche.vue'
import DossierInformations from './DossierInformations.vue'
import DossierDemande from './DossierDemande.vue'
import DossierAnnotations from './DossierAnnotations.vue'
import DossierHeader from './DossierHeader.vue'
import DossierMessagerie from './DossierMessagerie.vue'
import { formatForMessageDate } from '@/utils'
import apiClient from '@/api/api-client'
import AttachedFileList from '@/components/ag-grid/files/AttachedFileList.vue'
import type { ApiCall } from '@/components/ag-grid/server-side/pagination.utils'

const dossierStore = useDossierStore()

const isReady = ref(false) // Utiliser pour ordonner les tabs - sinon la tabulation de l'annotation est sélectionnée quand on clique sur une pièce jointe
const dossier = computed<IDossierFieldsOutput | undefined>(() => dossierStore?.dossier)
const demandeurEmail = computed<string | undefined>(() => dossier.value?.demandeurEmail)

const messages = computed(
  () =>
    dossier.value?.messages?.map(({ id, createdAt, body, email, attachments, attachment }: DossierMessage) => ({
      id,
      date: formatForMessageDate(new Date(createdAt)),
      email,
      body,
      attachments: [...(attachments ?? []), ...(attachment ? [attachment] : [])],
    })),
)
const hasMessages = computed(() => !!messages.value?.length && isReady.value)

const annotations = computed(() => dossier.value?.annotations)
const hasAnnotations = computed(() => !!annotations.value?.length && isReady.value)

const nbAttachments = ref(0)
const hasAttachments = computed(() => !!nbAttachments.value)
const showMessages = computed(() => hasMessages.value && !!dossier.value)
const showAttachments = computed(() => hasAttachments.value && !!dossier.value)

const fetchAttachedFiles: ApiCall<IFileOutput> = (params: IPagination<IFileOutput>) => {
  if (dossier.value) {
    return apiClient.getDossierFiles(dossier.value.id)(params)
  }
}

onMounted(async () => {
  const params = useRoute()?.params
  const id = Number(params.id)
  if (id) {
    await dossierStore.getDossierWithFields(id)
    nbAttachments.value = await apiClient.getDossierFilesSummary(id)
    isReady.value = true
  }
})

const currentDossierTab = ref<string | undefined>('demande')

const attachmentsTitle = computed(() => {
  return `Pièces jointes ${showAttachments.value ? `(${nbAttachments.value})` : ''}`
})
const messagesTitle = computed(() => {
  const count = dossier.value?.messages?.length ?? 0
  return `Messagerie ${hasMessages.value ? `(${count})` : ''}`
})
</script>

<template>
  <div class="flex flex-grow h-full overflow-hidden">
    <LayoutFiche
      title-bg-color="var(--blue-france-main-525)"
      title-fg-color="var(--text-inverted-grey)"
    >
      <template
        v-if="dossier"
        #title
      >
        <DossierHeader :dossier="dossier" />
      </template>
      <template #sub-title>
        <DossierInformations :datas="dossier" />
      </template>
      <template #content>
        <BnTabsContainer
          v-if="isReady"
          v-model="currentDossierTab"
          default-tab-id="demande"
          query-param-name="dossierTab"
        >
          <BnTab
            id="demande"
            title="Demande"
          >
            <DossierDemande
              v-if="dossier"
              id="dossier-demande"
              :datas="dossier"
            />
          </BnTab>
          <BnTab
            v-if="hasAnnotations"
            id="annotations"
            title="Annotations privées"
          >
            <DossierAnnotations :annotations="annotations" />
          </BnTab>
          <BnTab
            v-if="showAttachments"
            id="pieces-jointes"
            :title="attachmentsTitle"
          >
            <AttachedFileList
              class="h-full"
              :fetch-attached-files="fetchAttachedFiles"
              :active="currentDossierTab === 'pieces-jointes'"
              with-tab-tag
            />
          </BnTab>

          <BnTab
            v-if="showMessages"
            id="messagerie"
            :title="messagesTitle"
          >
            <DossierMessagerie
              :messages="messages"
              :demandeur-email="demandeurEmail"
            />
          </BnTab>
        </BnTabsContainer>
      </template>
    </LayoutFiche>
  </div>
</template>

<style scoped>
.messagerie {
  --at-apply: p-4 border-l-solid border-1 border- [var(--background-contrast-grey)];
}

.fr-bg-grey {
  --at-aply: bg- [var(--background-alt-grey)];
}

.fr-bg-white {
  --at-aply: bg- [var(--background-elevated-grey)];
}
</style>
