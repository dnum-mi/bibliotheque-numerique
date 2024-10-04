<script lang="ts" setup>
import { useTabs, DsfrTabs } from '@gouvminint/vue-dsfr'

import apiClient from '@/api/api-client'
import { dateToStringFr, copyCurrentUrlInClipboard } from '@/utils'
import LayoutFiche from '@/components/Layout/LayoutFiche.vue'
import ListeDossier from './ListeDossier.vue'
import OrganismeBadge from '@/components/Badges/organisme/OrganismeBadge.vue'
import { type OrganismeIdType, useOrganismeStore, useUserStore } from '@/stores'
import AttachedFileList from '@/components/ag-grid/files/AttachedFileList.vue'
import type { IFileOutput, IPagination, IRole, FileTagKey, ISiafFondationOutput, ISiafAssociationOutput } from '@biblio-num/shared'
import { Prefecture, dFileTabDictionary } from '@biblio-num/shared'
import type { ApiCall } from '@/components/ag-grid/server-side/pagination.utils'
import FicheOrganismePersons from './FicheOrganismePersons.vue'
import TooltipAddress from './TooltipAddress.vue'
import FicheInfoAssociaiton from './FicheInfoAssociaiton.vue'
import FicheInfoFondation from './FicheInfoFondation.vue'

const props = withDefaults(defineProps<{ id: string; idType: OrganismeIdType }>(), {})

const { ascendant, selected, select } = useTabs(true, 0)

const organismeStore = useOrganismeStore()
const userStore = useUserStore()

const organisme = computed(() => organismeStore.organisme)
const organismeSiaf = computed(() => organismeStore.organismeSiaf)
const hasSiaf = computed(() => !!organismeStore.organismeSiaf)
const prefecture = computed<string>(
  () => {
    const prefkey = `D${organisme.value?.addressPostalCode?.substring(0, 2) || ''}`
    return Prefecture[prefkey as keyof typeof Prefecture] || ''
  },
)
const creation = computed(() => dateToStringFr(organisme.value?.dateCreation))
const dissolution = computed(() => dateToStringFr(organisme.value?.dateDissolution ?? undefined))

const filesSummary = ref<Record<FileTagKey, number> | Record<string, never>>({})

const tabTitles = computed(() => {
  let headers = []

  if (hasSiaf.value) {
    headers.push({
      title: 'Infos-SIAF',
      tabId: 'tab-0',
      panelId: 'tab-content-0',
    })
  }
  if (organisme.value) {
    headers = headers.concat([{
      title: 'Infos',
      tabId: 'tab-1',
      panelId: 'tab-content-1',
    }, ...Object.entries(filesSummary.value).map(([tag, count], index: number) => {
      return {
        title: `${dFileTabDictionary[tag as FileTagKey]} (${count})`,
        tabId: `tab-${index + 2}`,
        panelId: `tab-content-${index + 2}`,
      }
    })])
  }
  return headers
})

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
  <div v-else-if="!(organisme || hasSiaf)">
    Organisme introuvable (id {{ idType }} {{ id }})
  </div>
  <div
    v-if="(organisme || hasSiaf) && !isLoading"
    class="flex flex-grow gap-2 h-full overflow-auto"
  >
    <LayoutFiche
      :class="organisme?.id ? 'flex-basis-[60%]' : 'flex-basis-[99%]'"
      class="overflow-auto"
      title-bg-color="var(--grey-200-850)"
      title-fg-color="var(--text-inverted-grey)"
    >
      <template v-if="organisme" #title>
        <OrganismeBadge
          :type="organisme?.type"
          class="mr-4"
          big
        />
        <span class="fr-text--lead fr-text--bold">{{ organisme?.idRna || organisme?.idRnf }} - </span>
        <span class="fr-text--lead">{{ organisme?.title }}</span>
      </template>
      <template v-else #title>
        <OrganismeBadge
          :type="(organismeSiaf as ISiafFondationOutput)?.identite.type_fondation || 'CULTE'"
          class="mr-4"
          big
        />
        <span class="fr-text--lead fr-text--bold">{{ (organismeSiaf as ISiafAssociationOutput)?.identite.id_rna || (organismeSiaf as ISiafFondationOutput)?.identite.id_rnf }} - </span>
        <span class="fr-text--lead">{{ organismeSiaf?.identite.nom }}</span>
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
              v-if="organismeSiaf"
              panel-id="tab-content-0"
              tab-id="tab-0"
              :selected="selected === 0"
              :asc="ascendant"
            >
              <FicheInfoAssociaiton v-if="idType === 'Rna'" :organisme-raf="(organismeSiaf as ISiafAssociationOutput)" />
              <FicheInfoFondation v-if="idType === 'Rnf'" :organisme-raf="(organismeSiaf as ISiafFondationOutput)" />
            </DsfrTabContent>
            <DsfrTabContent
              panel-id="tab-content-1"
              tab-id="tab-1"
              :selected="selected === (hasSiaf ? 1 : 0)"
              :asc="ascendant"
            >
              <div class="flex flex-col gap-6">
                <div class="flex gap-4">
                  <div class="flex-grow">
                    <label class="bn-fiche-sub-title--label">SIÈGE SOCIAL</label>
                    <TooltipAddress :show="!!(organisme?.addressLabel && !organisme?.addressType)" />
                    <span class="bn-fiche-sub-title--text">
                      {{ organisme?.addressLabel }}
                    </span>
                  </div>
                  <div class="flex-grow">
                    <label class="bn-fiche-sub-title--label">TÉLÉPHONE</label>
                    <span class="bn-fiche-sub-title--text">{{ organisme?.phoneNumber }}</span>
                  </div>
                  <div class="flex-grow">
                    <label class="bn-fiche-sub-title--label">COURRIEL</label>
                    <span class="bn-fiche-sub-title--text">{{ organisme?.email }}</span>
                  </div>
                  <div class="flex-grow">
                    <label class="bn-fiche-sub-title--label">PRÉFECTURE</label>
                    <span class="bn-fiche-sub-title--text">{{ prefecture }}</span>
                  </div>
                  <div class="flex-grow">
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
              </div>
              <div class="p-t-6">
                <FicheOrganismePersons
                  v-if="organisme?.persons"
                  :persons="organisme?.persons"
                />
              </div>
            </DsfrTabContent>
            <DsfrTabContent
              v-for="(tag, idx) in Object.keys(filesSummary)"
              :key="tag"
              :panel-id="`tab-content-${idx + 2}`"
              :tab-id="`tab-${idx + 2}`"
              :selected="selected === idx + 1 + (hasSiaf ? 1 : 0)"
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
          class="flex justify-center"
          label="Copier le lien"
          icon="ri-links-line"
          icon-right
          secondary
          @click="copyCurrentUrlInClipboard()"
        />
      </template>
    </LayoutFiche>

    <div v-if="organisme?.id" class="flex-basis-[40%] overflow-auto flex flex-col fr-pr-2w">
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
          :organisme-id="organisme?.id"
          :role="role"
        />
      </div>
    </div>
  </div>
</template>
