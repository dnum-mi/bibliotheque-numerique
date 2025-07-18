<script lang="ts" setup>
import apiClient from '@/api/api-client'
import LayoutFiche from '@/components/Layout/LayoutFiche.vue'
import ListeDossier from './ListeDossier.vue'
import OrganismeBadge from '@/components/Badges/organisme/OrganismeBadge.vue'
import { EOrganismeIdType, useOrganismeStore, useUserStore } from '@/stores'
import type { OrganismeIdType } from '@/stores'
import AttachedFileList from '@/components/ag-grid/files/AttachedFileList.vue'
import type {
  IFileOutput,
  IPagination,
  IRole,
  FileTagKey,
  ISiafAssociationOutput,
  IOrganismeOutputDto,
  ISiafRnfHistoryOutput,
  ISiafRnfOutput,
} from '@biblio-num/shared'
import {
  dFileTabDictionary,
  eOrganismeType,
  eState,
} from '@biblio-num/shared'
import type { ApiCall } from '@/components/ag-grid/server-side/pagination.utils'
import FicheInfoAssociation from './FicheInfoAssociation.vue'
import FicheInfoFondation from './FicheInfoFondation.vue'
import FicheOrganismeInfo from './FicheOrganismeInfo.vue'
import slugify from 'slugify'
import FicheOrganismeHistorique from './historique/FicheOrganismeHistorique.vue'
import BnRefreshSyncButton from '@/components/BnRefreshSyncButton.vue'
import { synchroniseOneOrganisme } from '../../../api/sudo-api-client'
import Spinner from '@/components/Spinner.vue'

const props = withDefaults(defineProps<{ id: string; idType: OrganismeIdType }>(), {})

const organismeStore = useOrganismeStore()
const userStore = useUserStore()

const organisme = computed(() => organismeStore.organisme as IOrganismeOutputDto)
const organismeSiaf = computed(() => organismeStore.organismeSiaf)
const syncState = computed(() => organismeStore.syncState)
const dossiersCount = computed(() => organismeStore.dossiersCount)

const hasSiaf = computed(() => !!organismeStore.organismeSiaf)
const hasSiafAssociation = computed(() => {
  const organisme = organismeSiaf.value as IOrganismeOutputDto | undefined
  return !!(organisme && organisme.type === eOrganismeType.ASSO)
})
const hasSiafFoundation = computed(() => {
  const organisme = organismeSiaf.value as IOrganismeOutputDto | undefined
  const types = [eOrganismeType.FDD, eOrganismeType.FE, eOrganismeType.FRUP]
  return !!(organisme && types.includes(organisme.type as (typeof types)[number]))
})

const filesSummary = ref<Record<FileTagKey, number> | Record<string, never>>({})
const histories = ref<ISiafRnfHistoryOutput[]>([])

// TODO: use router to prevent user to access this page if not logged in or without the right role
const role = computed<IRole | undefined>(() => userStore.currentUser?.role)

const isLoading = ref(false)

const loadOrganisme = async () => {
  await organismeStore.loadOrganisme(props.id, props.idType)
  if (organisme.value) {
    histories.value = await organismeStore.loadOrganismeHistory(props.id, props.idType)
    filesSummary.value = await apiClient.getOrganismeFilesSummary(organisme.value.id)
  }
}

const isSynchronising = computed(() => {
  return (syncState.value?.state === eState.uploading || syncState.value?.state === eState.queued)
    && organisme.value?.type === eOrganismeType.unknown
})

const isErrorSync = computed(() => {
  return syncState.value?.state === eState.failed
    && organisme.value?.type === eOrganismeType.unknown
})

onMounted(async () => {
  isLoading.value = true

  try {
    await loadOrganisme()
  } finally {
    isLoading.value = false
  }
})

const fetchAttachedFiles: ApiCall<IFileOutput> = (params: IPagination<IFileOutput>) => {
  if (organisme.value) {
    return apiClient.getOrganismeFiles(organisme.value.id)(params)
  }
}

const defaultTabId = computed(() => (hasSiafAssociation.value ? 'association' : 'infos'))
const currentFicheOrganismeTab = ref<string | undefined>(undefined)

const fileTabs = computed(() => {
  return Object.entries(filesSummary.value).map(([tag, count]) => {
    const originalName = dFileTabDictionary[tag as FileTagKey]
    return {
      key: tag,
      idTab: slugify(originalName),
      titleTab: `${originalName} (${count})`,
      originalTag: tag as FileTagKey,
    }
  })
})

const onRefreshSync = async () => {
  await synchroniseOneOrganisme(organisme.value.id)
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
    class="flex flex-grow gap-2 h-full"
  >
    <LayoutFiche
      :class="(organisme?.id && dossiersCount) ? 'flex-basis-[59%]' : 'flex-basis-[99%]'"
      class="overflow-auto"
      title-bg-color="var(--grey-200-850)"
      title-fg-color="var(--text-inverted-grey)"
    >
      <template
        #title
      >
        <div class="flex flex-grow gap-2 justify-between items-center">
          <div v-if="organisme">
            <OrganismeBadge
              :type="organisme?.type"
              class="mr-4"
              big
            />
            <span class="fr-text--lead fr-text--bold">{{ organisme?.idRna || organisme?.idRnf }} - </span>
            <span class="fr-text--lead">{{ organisme?.title }}</span>
          </div>
          <div v-else>
            <OrganismeBadge
              :type="(organismeSiaf as IOrganismeOutputDto)?.type"
              class="mr-4"
              big
            />
            <span class="fr-text--lead fr-text--bold">
              {{ (organismeSiaf as ISiafAssociationOutput)?.identite?.id_rna || (organismeSiaf as IOrganismeOutputDto)?.idRnf }} -
            </span>
            <span class="fr-text--lead">{{
              (organismeSiaf as ISiafAssociationOutput)?.identite?.nom || (organismeSiaf as IOrganismeOutputDto).title
            }}</span>
          </div>
          <div class="w-1/7">
            <BnRefreshSyncButton
              :sync-state="syncState"
              @refresh-sync="onRefreshSync"
              @refresh-data="loadOrganisme()"
            />
          </div>
        </div>
      </template>

      <template #content>
        <Spinner v-if="isSynchronising" message="Synchronisation en cours..." />
        <div v-else-if="isErrorSync" class="flex flex-col justify-center items-center p-10">
          <span class="fr-text--lg">Cette {{ idType === EOrganismeIdType.Rna ? "assocation" : "fondation" }} n'a pas pu être synchroniser.</span>
          <span class="fr-text--lg">Veuillez Contacter le support.</span>
        </div>
        <div v-else class="w-full h-full pl-4">
          <BnTabsContainer
            v-model="currentFicheOrganismeTab"
            :default-tab-id="defaultTabId"
          >
            <BnTab
              v-if="hasSiafAssociation"
              id="association"
              title="RAF"
            >
              <FicheInfoAssociation
                v-if="idType === EOrganismeIdType.Rna"
                :organisme-raf="organismeSiaf as IOrganismeOutputDto"
              />
            </BnTab>
            <BnTab
              id="infos"
              title="Infos"
            >
              <FicheInfoFondation
                v-if="hasSiafFoundation && organismeSiaf"
                :organisme-raf="organismeSiaf as IOrganismeOutputDto"
              />
              <FicheOrganismeInfo
                v-else
                :organisme="organisme"
                :type="idType"
              />
            </BnTab>
            <BnTab
              v-for="tabInfo in fileTabs"
              :id="tabInfo.idTab"
              :key="tabInfo.key"
              :title="tabInfo.titleTab"
            >
              <AttachedFileList
                :key="tabInfo.key"
                class="h-full"
                :fetch-attached-files="fetchAttachedFiles"
                :tag="tabInfo.originalTag"
                :active="currentFicheOrganismeTab === tabInfo.idTab"
              />
            </BnTab>
            <BnTab
              v-if="idType === EOrganismeIdType.Rnf"
              id="historique"
              title="Historique"
            >
              <FicheOrganismeHistorique
                :actual="organisme.rnfJson as ISiafRnfOutput"
                :history="histories"
                :entity-type="idType"
              />
            </BnTab>
          </BnTabsContainer>
        </div>
      </template>
    </LayoutFiche>

    <div
      v-if="organisme?.id && dossiersCount"
      class="flex-basis-[40%] overflow-auto flex flex-col fr-pr-2w"
    >
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
          :role="role as IRole"
        />
      </div>
    </div>
  </div>
</template>
