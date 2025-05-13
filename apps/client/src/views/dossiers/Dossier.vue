<script lang="ts" setup>
import type {
  Message as DossierMessage,
} from '@dnum-mi/ds-api-client'
import type {
  IDossier as IDossierOutput,
  IFileOutput,
  IPagination,
} from '@biblio-num/shared'

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
import { DsfrSegmentedSet } from '@gouvminint/vue-dsfr'

const dossierStore = useDossierStore()

const isReady = ref(false) // Utiliser pour ordonner les tabs - sinon la tabulation de l'annotation est sélectionnée quand on clique sur une pièce jointe
const dossier = computed<IDossierOutput | undefined>(() => dossierStore?.dossier)
const dossierDS = computed<IDossierOutput['dsDataJson'] | undefined>(() => dossier.value?.dsDataJson)
const demandeurEmail = computed<string | undefined>(() => dossier.value?.dsDataJson.usager?.email)

const messages = computed(() =>
  dossier.value?.dsDataJson.messages?.map(({ id, createdAt, body, email, attachments, attachment }: DossierMessage) => ({
    id,
    date: formatForMessageDate(new Date(createdAt)),
    email,
    body,
    attachments: [...(attachments ?? []), ...(attachment ? [attachment] : [])],
  })),
)
const hasMessages = computed(() => !!messages.value?.length && isReady.value)

const annotations = computed(() => dossier.value?.dsDataJson.annotations)
const hasAnnotations = computed(() => !!annotations.value?.length && isReady.value)

const nbAttachments = ref(0)
const hasAttachments = computed(() => !!nbAttachments.value)

const fetchAttachedFiles: ApiCall<IFileOutput> = (params: IPagination<IFileOutput>) => {
  if (dossier.value) {
    return apiClient.getDossierFiles(dossier.value.id)(params)
  }
}

onMounted(async () => {
  const params = useRoute()?.params
  const id = Number(params.id)
  if (id) {
    await dossierStore.getDossier(id)
    nbAttachments.value = await apiClient.getDossierFilesSummary(id)
    isReady.value = true
  }
})

// TODO: A factoriser BEGIN
const selectedTabIndex = ref(0)
const showMessages = computed(() => hasMessages.value && !!dossier.value)
const showAttachments = computed(() => hasAttachments.value && !!dossier.value)

const tabTitles = computed<{ value: number, label: string }[]>(() => [
  { value: 0, label: 'Demande' },
  ...(hasAnnotations.value ? [{ value: 1, label: 'Annotations privées' }] : []),
  ...(showAttachments.value ? [{ value: 2, label: `Pièces jointes (${nbAttachments.value})` }] : []),
  ...(showMessages.value ? [{ value: 3, label: `Messagerie (${messages?.value?.length})` }] : []),
])

// TODO: A factoriser END
</script>

<template>
  <div class="flex gap-2 flex-grow overflow-auto">
    <div class="flex-basis-[60%] flex-grow overflow-auto">
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
          <DossierInformations :datas="dossierDS" />
        </template>
        <template #content>
          <!-- @select-tab="selectTab" -->

          <!-- TODO: a factoriser BEGIN -->
          <DsfrSegmentedSet
            v-model="selectedTabIndex"
            :inline="false"
            :options="tabTitles"
            :small="false"
            class="simulate-tabs"
          />
          <div class="flex flex-row h-full fr-pl-1w fr-pr-1w">
            <Transition
              name="slide-fade"
              mode="in-out"
            >
              <!-- Dossiers -->
              <div
                v-show="selectedTabIndex === 0"
                class="flex-grow bn-scroll-parent fr-pt-2w"
              >
                <DossierDemande
                  id="dossier-demande"
                  :datas="dossierDS"
                />
              </div>
            </Transition>
            <Transition
              name="slide-fade"
              mode="in-out"
            >
              <template
                v-if="hasAnnotations"
              >
                <div
                  v-show="selectedTabIndex === 1"
                  class="flex-grow bn-scroll-parent fr-pt-2w"
                >
                  <DossierAnnotations
                    :annotations="annotations"
                  />
                </div>
              </template>
            </Transition>
            <Transition
              name="slide-fade"
              mode="in-out"
            >
              <template
                v-if="showAttachments"
              >
                <div
                  v-show="selectedTabIndex === 2"
                  class="flex-grow bn-scroll-parent fr-pt-2w"
                >
                  <AttachedFileList
                    class="h-full"
                    :fetch-attached-files="fetchAttachedFiles"
                    :active="selectedTabIndex === 2"
                    with-tab-tag
                  />
                </div>
              </template>
            </Transition>
            <Transition
              name="slide-fade"
              mode="in-out"
            >
              <template
                v-if="showMessages"
              >
                <div
                  v-show="selectedTabIndex === 3"
                  class="flex-grow bn-scroll-parent fr-pt-2w"
                >
                  <DossierMessagerie
                    :messages="messages"
                    :demandeur-email="demandeurEmail"
                  />
                </div>
              </template>
            </Transition>
          </div>
          <!-- TODO: a factoriser END -->
        </template>
      </LayoutFiche>
    </div>
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

/* TODO: A factoriser BEGIN*/
.simulate-tabs {
  position: relative;
  border-bottom: 1px solid var(--border-default-grey);
  padding-left: 1rem;
}

:deep(.fr-segmented__elements) {
  gap: 0.5rem;
  box-shadow: none !important;
}

:deep(.fr-segmented__element) {
  border-radius: 0;
  background: var(--background-action-low-blue-france);
  font-weight: bolder !important;
}

:deep(.fr-segmented__element:hover) {
  background: var(--background-action-low-blue-france-hover) !important;
}

.simulate-tabs :deep(input:hover+label) {
  background: var(--background-action-low-blue-france-hover) !important;
}

.simulate-tabs :deep(input:checked+label) {
  background: white;
  color: var(--border-active-blue-france) !important;
  border: none;
  border-radius: 0;
  border-inline: 1px solid var(--border-default-grey);
  border-bottom: 1px solid white;
  margin-bottom: -1px;
  box-shadow: 0 -2px 0 0 var(--border-active-blue-france) !important;
}

.slide-fade-enter-active {
  transition: all 0.2s linear;
}

.slide-fade-leave-active {
  transition: all 0.2s linear;
}

.slide-fade-enter-from {
  transform: translateX(v-bind(translateValueFrom));
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(v-bind(translateValueTo));
  opacity: 0;
}
/* TODO: A factoriser END*/
</style>
