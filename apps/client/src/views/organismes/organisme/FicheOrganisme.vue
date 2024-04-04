<script lang="ts" setup>
import { useTabs, DsfrTabs } from '@gouvminint/vue-dsfr'

import apiClient from '@/api/api-client'
import { dateToStringFr, copyCurrentUrlInClipboard } from '@/utils'
import LayoutFiche from '@/components/Layout/LayoutFiche.vue'
import ListeDossier from './ListeDossier.vue'
import OrganismeBadge from '@/components/Badges/organisme/OrganismeBadge.vue'
import InfoContact from '@/components/InfoContact.vue'
import { type OrganismeIdType, useOrganismeStore, useUserStore } from '@/stores'
import AttachedFileList from '@/components/ag-grid/files/AttachedFileList.vue'
import type { IFileOutput, IPagination, IRole, FileTagKey } from '@biblio-num/shared'
import { dFileTabDictionary } from '@biblio-num/shared'
import type { ApiCall } from '@/components/ag-grid/server-side/pagination.utils'
import FicheOrganismePersons from './FicheOrganismePersons.vue'

const props = withDefaults(defineProps<{ id: string; idType: OrganismeIdType }>(), {})

const { ascendant, selected, select } = useTabs(true, 0)

const organismeStore = useOrganismeStore()
const userStore = useUserStore()

const organisme = computed(() => organismeStore.organisme)
const prefecture = computed(
  () => `${organismeStore.organisme?.addressPostalCode?.substring(0, 2) || ''} ${organismeStore.organisme?.addressCityName || ''}`,
)
const creation = computed(() => dateToStringFr(organisme.value?.dateCreation))
const dissolution = computed(() => dateToStringFr(organisme.value?.dateDissolution ?? undefined))

const filesSummary = ref<Record<FileTagKey, number> | Record<string, never>>({})

const tabTitles = computed(() => [
  {
    title: 'Infos',
    tabId: 'tab-0',
    panelId: 'tab-content-0',
  },
  ...Object.entries(filesSummary.value).map(([tag, count], index: number) => {
    return {
      title: `${dFileTabDictionary[tag as FileTagKey]} (${count})`,
      tabId: `tab-${index + 1}`,
      panelId: `tab-content-${index + 1}`,
    }
  }),
])

// TODO: use router to prevent user to access this page if not logged in or without the right role
const role = computed<IRole | undefined>(() => userStore.currentUser?.role)

const isLoading = ref(false)
onMounted(async () => {
  isLoading.value = true
  try {
    await organismeStore.loadOrganisme(props.id, props.idType)
  } finally {
    isLoading.value = false
  }
  if (organisme.value) {
    filesSummary.value = await apiClient.getOrganismeFilesSummary(organisme.value.id)
  }
})

const tabs = ref<InstanceType<typeof DsfrTabs>>()
const redrawTabs = async () => {
  await nextTick()
  await nextTick() // Yes, we need to call nextTick twice to make sure the tabs are rendered
  tabs.value?.renderTabs()
}

const activeTabs = ref<Record<string, boolean>>({})
watch(selected, (idx) => {
  if (idx > 0) {
    const tag = Object.keys(filesSummary.value)[idx - 1]
    activeTabs.value[tag] = true
  }
  redrawTabs()
})

const fetchAttachedFiles: ApiCall<IFileOutput> = (params: IPagination<IFileOutput>) => {
  if (organisme.value) {
    return apiClient.getOrganismeFiles(organisme.value.id)(params)
  } else {
    console.log('pas d\'organisme')
  }
}
</script>

<template>
  <div v-if="isLoading">
    Chargement en cours, veuillez patienter...
  </div>
  <div v-else-if="!organisme">
    Organisme introuvable (id {{ idType }} {{ id }})
  </div>
  <div
    v-if="organisme && !isLoading"
    class="flex  flex-grow  gap-2  h-full  overflow-auto"
  >
    <LayoutFiche
      class="flex-basis-[60%]  overflow-auto"
      title-bg-color="var(--grey-200-850)"
      title-fg-color="var(--text-inverted-grey)"
    >
      <template #title>
        <OrganismeBadge
          :type="organisme.type"
          class="mr-4"
          big
        />
        <span class="fr-text--lead fr-text--bold">{{ organisme.idRna }} -</span>
        <span class="fr-text--lead">{{ organisme.title }}</span>
      </template>
      <template #sub-title>
        <div class="flex gap-4">
          <div class="flex-grow">
            <label class="bn-fiche-sub-title--label">SIÈGE SOCIAL</label>
            <span class="bn-fiche-sub-title--text">{{ organisme.addressLabel }}</span>
          </div>
          <div class="flex-grow">
            <label class="bn-fiche-sub-title--label">PRÉFECTURE</label>
            <span class="bn-fiche-sub-title--text">{{ prefecture }}</span>
          </div>
          <div>
            <label class="bn-fiche-sub-title--label">CRÉATION</label>
            <span class="bn-fiche-sub-title--text">{{ creation }}</span>
          </div>
          <div>
            <label class="bn-fiche-sub-title--label">ALERTE</label>
            <DsfrBadge
              no-icon
              small
              label="OK"
            />
          </div>
          <div
            v-if="dissolution"
            class=""
          >
            <label class="bn-fiche-sub-title--label">DISSOLUTION</label>
            <span class="bn-fiche-sub-title--text">{{ dissolution }}</span>
          </div>
        </div>
      </template>
      <template #content>
        <div class="w-full h-full pl-4">
          <DsfrTabs
            ref="tabs"
            tab-list-name="tabs-fiche"
            :tab-titles="tabTitles"
            :initial-selected-index="selected"
            class="h-full"
            @select-tab="select"
          >
            <DsfrTabContent
              panel-id="tab-content-0"
              tab-id="tab-0"
              :selected="selected === 0"
              :asc="ascendant"
            >
              <div class="flex flex-col gap-6">
                <div class="flex flex-row gap-2 items-center">
                  <div class="fr-mr-2w bn-icon--blue-france-main-525">
                    <span
                      class="fr-icon-question-answer-line"
                      aria-hidden="true"
                    />
                  </div>

                  <span class="fr-text fr-text--bold">Adresse et contacts</span>
                </div>

                <InfoContact
                  :name="organisme.title"
                  :info="organisme.addressLabel ?? ''"
                  :email="organisme.email ?? ''"
                  :phone="organisme.phoneNumber ?? ''"
                />
              </div>
              <div class="p-t-6">
                <FicheOrganismePersons :persons="organisme.persons" />
              </div>
            </DsfrTabContent>
            <DsfrTabContent
              v-for="(tag, idx) in Object.keys(filesSummary)"
              :key="tag"
              :panel-id="`tab-content-${idx + 1}`"
              :tab-id="`tab-${idx + 1}`"
              :selected="selected === idx + 1"
              :asc="ascendant"
            >
              <AttachedFileList
                :key="tag"
                :fetch-attached-files="fetchAttachedFiles"
                :tag="tag"
                :active="activeTabs[tag]"
                @files-fetched="redrawTabs()"
              />
            </DsfrTabContent>
          </DsfrTabs>
        </div>
      </template>
      <template #footer>
        <DsfrButton
          :style="{ width: '50%' }"
          class="flex  justify-center"
          label="Copier le lien"
          icon="ri-links-line"
          icon-right
          secondary
          @click="copyCurrentUrlInClipboard()"
        />
      </template>
    </LayoutFiche>

    <div class="flex-basis-[40%]  overflow-auto  flex  flex-col  fr-pr-2w">
      <div class="fr-p-3w flex align-center gap-3">
        <div class="bn-icon--green-archipel">
          <span
            class="fr-icon-book-2-line"
            aria-hidden="true"
          />
        </div>
        <h4 class="fr-text--bold m-0">
          Dossiers déposés
        </h4>
      </div>
      <div class="w-full">
        <ListeDossier
          :organisme-id="organisme.id"
          :role="role"
        />
      </div>
    </div>
  </div>
</template>
