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
import type { DsfrTabs } from '@gouvminint/vue-dsfr'

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

const tabTitles = computed(() => {
  return [
    {
      title: 'Demande',
      component: 'DossierDemande',
    },
    ...(hasAnnotations.value ? [{ title: 'Annotations privées', component: 'DossierAnnotations' }] : []),
    ...(hasAttachments.value && !!dossier.value ? [{ title: `Pièces jointes (${nbAttachments.value})`, component: 'AttachedFileList' }] : []),
    ...(hasMessages.value && !!dossier.value ? [{ title: `Messagerie (${messages?.value?.length})`, component: 'DossierMessagerie' }] : []),
  ]
})
const initialSelectedIndex = 0
const selectedTabIndex = ref(initialSelectedIndex)

const tabs = ref<InstanceType<typeof DsfrTabs>>()

const selectPrevious = () => {
  const newIndex = selectedTabIndex.value === 0 ? tabTitles.value.length - 1 : selectedTabIndex.value - 1
  selectedTabIndex.value = newIndex
}
const selectNext = () => {
  const newIndex = selectedTabIndex.value === tabTitles.value.length - 1 ? 0 : selectedTabIndex.value + 1
  selectedTabIndex.value = newIndex
}
const selectFirst = () => {
  selectedTabIndex.value = 0
}
const selectLast = () => {
  selectedTabIndex.value = tabTitles.value.length - 1
}

const fetchAttachedFiles: ApiCall<IFileOutput> = (params: IPagination<IFileOutput>) => {
  if (dossier.value) {
    return apiClient.getDossierFiles(dossier.value.id)(params)
  }
}
const redrawTabs = async () => {
  await nextTick()
  await nextTick() // Yes, we need to call nextTick twice to make sure the tabs are rendered
  tabs.value?.renderTabs()
}

// TODO: Pour redessiner Ag-grid, Vérifier si c'est toujours utile
// const hasFileTabBeenSelected = ref(false)
// watch(selectedTabIndex, () => {
//   if (selectedTabIndex.value === (hasAnnotations.value ? 2 : 1)) {
//     hasFileTabBeenSelected.value = true
//   }
//   redrawTabs()
// })

onMounted(async () => {
  const params = useRoute()?.params
  const id = Number(params.id)
  if (id) {
    await dossierStore.getDossier(id)
    nbAttachments.value = await apiClient.getDossierFilesSummary(id)
    isReady.value = true
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
          <!-- @select-tab="selectTab" -->
          <DsfrTabs
            ref="tabs"
            v-model="selectedTabIndex"
            :tab-titles="tabTitles"
            class="fr-ml-2w"
            tab-list-name="tabs-dossier"
          >
            <template #tab-items>
              <DsfrTabItem
                v-for="(tab, index) of tabTitles"
                :key="`tab-${index}`"
                :tab-id="`tab-${index}`"
                :panel-id="`tab-content-${index}`"
                @click="selectedTabIndex = index;"
                @next="selectNext()"
                @previous="selectPrevious()"
                @first="selectFirst()"
                @last="selectLast()"
              >
                {{ tab.title }}
              </DsfrTabItem>
            </template>

            <DsfrTabContent
              v-for="(tab, index) of tabTitles"
              :key="`tab-content-${index}`"
              :panel-id="`tab-content-${index}`"
              :tab-id="`tab-${index}`"
            >
              <DossierDemande
                v-if="tab.component === 'DossierDemande'"
                :datas="dossierDS"
              />
              <DossierAnnotations
                v-if="tab.component === 'DossierAnnotations'"
                :annotations="annotations"
              />
              <!-- :active="hasFileTabBeenSelected" -->
              <AttachedFileList
                v-if="tab.component === 'AttachedFileList'"
                :fetch-attached-files="fetchAttachedFiles"
                :active="true"
                with-tab-tag
                @files-fetched="redrawTabs()"
              />
              <DossierMessagerie
                v-if="tab.component === 'DossierMessagerie'"
                :messages="messages"
                :demandeur-email="demandeurEmail"
              />
            </DsfrTabContent>
          </DsfrTabs>
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
</style>
