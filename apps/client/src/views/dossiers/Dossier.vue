<script lang="ts" setup>
import type { Champ, DossierOutputDto, PieceJustificativeChamp, DossierMessage } from '@biblio-num/shared-utils'

import { useDossierStore } from '@/stores/dossier'
import LayoutFiche from '@/components/Layout/LayoutFiche.vue'
import DossierInformations from './DossierInformations.vue'
import DossierDemande from './DossierDemande.vue'
import DossierAnnotations from './DossierAnnotations.vue'
import AttachmentList from '@/components/AttachmentList.vue'
import DossierHeader from './DossierHeader.vue'
import DossierMessagerie from './DossierMessagerie.vue'
import { copyCurrentUrlInClipboard, formatForMessageDate } from '@/utils'

const dossierStore = useDossierStore()
const dossier = computed<DossierOutputDto | undefined>(() => dossierStore?.dossier)
const dossierDS = computed<DossierOutputDto['dsDataJson'] | undefined>(() => dossier.value?.dsDataJson)

const messages = computed(() => dossier.value?.dsDataJson.messages.map(({ id, createdAt, body, email, attachments, attachment }: DossierMessage) => ({
  id,
  date: formatForMessageDate(new Date(createdAt)),
  email,
  body,
  attachments: [...(attachments ?? []), ...(attachment ? [attachment] : [])],
})))

const annotations = computed(() => dossier.value?.dsDataJson.annotations)

const attachments = computed(
  () => dossierDS.value?.champs
    .reduce((files: Champ[], champ: PieceJustificativeChamp) => {
      if (champ.__typename === 'PieceJustificativeChamp' && champ.file != null) {
        return [...files, champ.file]
      }
      return files
    }, []),
)

const hasAnnotations = computed(() => !!annotations.value?.length)
const hasAttachments = computed(() => !!attachments.value?.length)

const tabTitles = computed(() => [
  {
    title: 'Demande',
  },
  ...hasAnnotations.value
    ? [{ title: 'Annotations privées' }]
    : [],
  ...hasAttachments.value
    ? [{ title: `Pièces jointes (${attachments.value.length})` }]
    : [],
])
const initialSelectedIndex = 0
const selectedTabIndex = ref(initialSelectedIndex)
const asc = ref(true)
function selectTab (idx:number) {
  asc.value = selectedTabIndex.value < idx
  selectedTabIndex.value = idx
}

onMounted(async () => {
  const params = useRoute()?.params
  const id = Number(params.id)
  if (id) {
    await dossierStore.getDossier(id)
  }
})
</script>

<template>
  <div class="flex  gap-2  flex-grow  overflow-auto">
    <div class="flex-basis-[60%]  flex-grow  overflow-auto">
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
              panel-id="tab-content-1"
              tab-id="tab-1"
              :selected="selectedTabIndex === 1"
              :asc="asc"
            >
              <DossierAnnotations :annotations="annotations" />
            </DsfrTabContent>
            <DsfrTabContent
              panel-id="tab-content-2"
              tab-id="tab-2"
              :selected="selectedTabIndex === (hasAnnotations ? 2 : 1)"
              :asc="asc"
            >
              <AttachmentList :files="attachments ?? []" />
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
      class="flex-basis-[40%]  fr-pr-2v  overflow-y-auto"
      :messages="messages"
    />
  </div>
</template>

<style scoped>
.messagerie {
  --at-apply: p-4  border-l-solid  border-1  border-[var(--background-contrast-grey)];
}

.fr-bg-grey {
  --at-aply: bg-[var(--background-alt-grey)];
}
.fr-bg-white {
  --at-aply: bg-[var(--background-elevated-grey)];
}
</style>
