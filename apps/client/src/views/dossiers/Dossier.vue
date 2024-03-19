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
import { copyCurrentUrlInClipboard, formatForMessageDate } from '@/utils'
import apiClient from '@/api/api-client'
import AttachedFileList from '@/components/ag-grid/files/AttachedFileList.vue'
import { DsfrTabs } from '@gouvminint/vue-dsfr'
import type { ApiCall } from '@/components/ag-grid/server-side/pagination.utils'

const dossierStore = useDossierStore()
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

const annotations = computed(() => dossier.value?.dsDataJson.annotations)

const hasAnnotations = computed(() => !!annotations.value?.length)
const nbAttachments = ref(0)
const hasAttachments = computed(() => !!nbAttachments.value)
const tabTitles = computed(() => [
  {
    title: 'Demande',
  },
  ...(hasAnnotations.value ? [{ title: 'Annotations privées' }] : []),
  ...(hasAttachments.value ? [{ title: `Pièces jointes (${nbAttachments.value})` }] : []),
])
const initialSelectedIndex = 0
const selectedTabIndex = ref(initialSelectedIndex)
const asc = ref(true)

function selectTab (idx: number) {
  asc.value = selectedTabIndex.value < idx
  selectedTabIndex.value = idx
}

const tabs = ref<InstanceType<typeof DsfrTabs>>()
const fetchAttachedFiles: ApiCall<IFileOutput> = (params: IPagination<IFileOutput>) => {
  if (dossier.value) {
    return apiClient.getDossierFiles(dossier.value.id)(params)
  } else {
    console.log('pas de dossier')
  }
}
const redrawTabs = async () => {
  await nextTick()
  await nextTick() // Yes, we need to call nextTick twice to make sure the tabs are rendered
  tabs.value?.renderTabs()
}

const hasFileTabBeenSelected = ref(false)
watch(selectedTabIndex, () => {
  if (selectedTabIndex.value === (hasAnnotations.value ? 2 : 1)) {
    hasFileTabBeenSelected.value = true
  }
  redrawTabs()
})

onMounted(async () => {
  const params = useRoute()?.params
  const id = Number(params.id)
  if (id) {
    await dossierStore.getDossier(id)
    nbAttachments.value = await apiClient.getDossierFilesSummary(id)
  }
})
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
          <DsfrTabs
            ref="tabs"
            class="fr-ml-2w"
            tab-list-name="tabs-dossier"
            :tab-titles="tabTitles"
            :initial-selected-index="initialSelectedIndex"
            @select-tab="selectTab"
          >
            <DsfrTabContent
              panel-id="tab-content-0"
              tab-id="tab-0"
              :selected="selectedTabIndex === 0"
              :asc="asc"
            >
              <DossierDemande :datas="dossierDS" />
            </DsfrTabContent>
            <DsfrTabContent
              v-if="hasAnnotations"
              panel-id="tab-content-1"
              tab-id="tab-1"
              :selected="selectedTabIndex === 1"
              :asc="asc"
            >
              <DossierAnnotations :annotations="annotations" />
            </DsfrTabContent>
            <DsfrTabContent
              :panel-id="`tab-content-${+hasAnnotations + 1}`"
              :tab-id="`tab-${+hasAnnotations + 1}`"
              :selected="selectedTabIndex === (+hasAnnotations + 1)"
              :asc="asc"
            >
              <AttachedFileList
                :fetch-attached-files="fetchAttachedFiles"
                :active="hasFileTabBeenSelected"
                with-tab-tag
                @files-fetched="redrawTabs()"
              />
            </DsfrTabContent>
          </DsfrTabs>
        </template>
        <template #footer>
          <DsfrButton
            type="button"
            label="Copier le lien"
            icon="ri-links-line"
            secondary
            @click="copyCurrentUrlInClipboard()"
          />
        </template>
      </LayoutFiche>
    </div>
    <DossierMessagerie
      v-if="messages?.length"
      class="flex-basis-[40%] fr-pr-2v overflow-y-auto"
      :messages="messages"
      :demandeur-email="demandeurEmail"
    />
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
