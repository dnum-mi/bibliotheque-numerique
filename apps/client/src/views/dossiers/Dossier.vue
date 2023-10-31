<script lang="ts" setup>
import { faker } from '@faker-js/faker'
import { useRoute } from 'vue-router'
import { computed, onMounted, ref } from 'vue'

import type { DossierOutputDto } from '@biblio-num/shared'

import { useDossierStore } from '@/stores/dossier'
import LayoutFiche from '@/components/Layout/LayoutFiche.vue'
import DossierInformations from './DossierInformations.vue'
import DossierDemande from './DossierDemande.vue'
import DossierAnnotations from './DossierAnnotations.vue'
import DossierMessages from './DossierMessages.vue'
import DossierHeader from './DossierHeader.vue'
import DossierMessagerie from './DossierMessagerie.vue'
import { LOCALE_FOR_DATE_TIME } from '@/config'

const dossierStore = useDossierStore()
const dossier = computed<DossierOutputDto | undefined>(() => dossierStore?.dossier)
const dossierDS = computed<DossierOutputDto['dsDataJson'] | undefined>(() => dossierStore?.dossier?.dsDataJson)

/* region Fake data */
const attachedFilesNb = computed(() => 3)
const hasAccessToDetails = computed(() => true)

const possibleExtensions = ['pdf', 'doc', 'docx', 'xsl', 'xslx', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'csv', 'odt', 'ods']
const generateAttachment = () => ({
  name: faker.system.fileName().split('.').slice(0, -1).join('.') // Remove extension
    .concat('.', faker.helpers.arrayElement(possibleExtensions)), // Add random extension from possibleExtensions
  size: `${faker.string.numeric({ length: { min: 1, max: 3 } })} Mo`,
})
const generateMessage = () => ({
  id: 1,
  title: 'Message 1',
  from: faker.internet.email({
    firstName: faker.person.firstName().toLocaleLowerCase(),
    lastName: faker.person.lastName().toLocaleLowerCase(),
    provider: 'interieur.gouv.fr',
  }),
  date: new Intl.DateTimeFormat(LOCALE_FOR_DATE_TIME, { dateStyle: 'long', timeStyle: 'medium' }).format(faker.date.past()),
  body: faker.lorem.paragraph(),
  attachments: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, generateAttachment),
})
const messages = Array.from({ length: 25 }, generateMessage)
/* endregion Fake data */

const tabTitles = [
  {
    title: 'Demande',
  },
  ...(hasAccessToDetails.value
    ? [
        {
          title: 'Annotations privées',
        },
        {
          title: `Piecès jointes (${attachedFilesNb.value})`,
        },
      ]
    : []
  ),
]
const initialSelectedIndex = 0
const selectedTabIndex = ref(0)
function selectTab (idx:number) {
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
  <div class="flex  gap-2  flex-grow  min-h-0  overflow-auto">
    <div class="organisme  min-h-0  fr-pl-2v overflow-auto">
      <LayoutFiche>
        <template #title>
          <DossierHeader :dossier="dossier" />
        </template>
        <template #sub-title>
          <DossierInformations :datas="dossierDS" />
        </template>
        <template #content>
          <DsfrTabs
            tab-list-name="tabs-dossier"
            :tab-titles="tabTitles"
            :initial-selected-index="initialSelectedIndex"
            @select-tab="selectTab"
          >
            <DsfrTabContent
              panel-id="tab-content-0"
              tab-id="tab-0"
              :selected="selectedTabIndex === 0"
            >
              <DossierDemande :datas="dossierDS" />
            </DsfrTabContent>
            <DsfrTabContent
              panel-id="tab-content-1"
              tab-id="tab-1"
              :selected="selectedTabIndex === 1"
            >
              <DossierAnnotations :datas="dossierDS" />
            </DsfrTabContent>
            <DsfrTabContent
              panel-id="tab-content-2"
              tab-id="tab-2"
              :selected="selectedTabIndex === 2"
            >
              <DossierMessages :datas="dossierDS" />
            </DsfrTabContent>
          </DsfrTabs>
        </template>
      </LayoutFiche>
    </div>
    <DossierMessagerie
      class="messagerie  min-h-0  overflow-auto"
      :messages="messages"
    />
  </div>
</template>

<style scoped>
.organisme {
  flex-basis: 60%;
}
.messagerie {
  flex-basis: 40%;
  overflow-y: auto;
  --at-apply: p-4  border-l-solid  border-1  border-[var(--background-contrast-grey)];
}

.fr-bg-grey {
  --at-aply: bg-[var(--background-alt-grey)];
}
.fr-bg-white {
  --at-aply: bg-[var(--background-elevated-grey)];
}
</style>
