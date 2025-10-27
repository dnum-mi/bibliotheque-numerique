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
  IOrganismeOutputDto,
  // ISiafRnfHistoryOutput,
} from '@biblio-num/shared'
import { dFileTabDictionary, eOrganismeType, eState } from '@biblio-num/shared'
import type { ApiCall } from '@/components/ag-grid/server-side/pagination.utils'
import FicheInfoAssociation from './FicheInfoAssociation.vue'
import FicheInfoFondation from './FicheInfoFondation.vue'
import FicheOrganismeInfo from './FicheOrganismeInfo.vue'
import slugify from 'slugify'
// import FicheOrganismeHistorique from './historique/FicheOrganismeHistorique.vue'
import BnRefreshSyncButton from '@/components/BnRefreshSyncButton.vue'
import { synchroniseOneOrganisme } from '../../../api/sudo-api-client'
import Spinner from '@/components/Spinner.vue'
import { dateToStringFr } from '@/utils'
import FicheOrganismePersons from './FicheOrganismePersons.vue'

const props = withDefaults(defineProps<{ id: string; idType: OrganismeIdType }>(), {})

const organismeStore = useOrganismeStore()
const userStore = useUserStore()

const organisme = computed(() => organismeStore.organisme as IOrganismeOutputDto)
const organismeSiaf = computed(() => organismeStore.organismeSiaf)
const syncState = computed(() => organismeStore.syncState)
const dossiersCount = computed(() => organismeStore.dossiersCount)
// TODO: A voir si RAF retourne cette date
const rnaImportedAt = computed(() => /* (organisme.value?.rnaJson as IAssociationOutput)?.rnaImportedAt*/'')
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
// const histories = ref<ISiafRnfHistoryOutput[]>([])

// TODO: use router to prevent user to access this page if not logged in or without the right role
const role = computed<IRole | undefined>(() => userStore.currentUser?.role)

const isLoading = ref(false)

const loadOrganisme = async () => {
  await organismeStore.loadOrganisme(props.id, props.idType)
  if (organisme.value) {
    // histories.value = await organismeStore.loadOrganismeHistory(props.id, props.idType)
    filesSummary.value = await apiClient.getOrganismeFilesSummary(organisme.value.id)
  }
}

const isSynchronising = computed(() => {
  return (
    (syncState.value?.state === eState.uploading || syncState.value?.state === eState.queued) &&
    organisme.value?.type === eOrganismeType.unknown
  )
})

const isErrorSync = computed(() => {
  return syncState.value?.state === eState.failed && organisme.value?.type === eOrganismeType.unknown
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

onUpdated(() => {
  console.log(fileTabs.value)
})

const onRefreshSync = async () => {
  await synchroniseOneOrganisme(organisme.value.id)
}
</script>

<template>
  <div v-if="isLoading">Chargement en cours, veuillez patienter...</div>
  <div v-else-if="!(organisme || hasSiaf)">Organisme introuvable (id {{ idType }} {{ id }})</div>
  <div
    v-if="(organisme || hasSiaf) && !isLoading"
    class="flex flex-grow gap-2 h-full"
  >
    <!-- :class="(organisme?.id && dossiersCount) ? 'flex-basis-[59%]' : 'flex-basis-[99%]'" -->
    <LayoutFiche
      class="overflow-auto"
      title-bg-color="var(--grey-200-850)"
      title-fg-color="var(--text-inverted-grey)"
    >
      <template #title>
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
            <span class="fr-text--lead fr-text--bold"> {{ organismeSiaf?.idRna || organismeSiaf?.idRnf }} - </span>
            <span class="fr-text--lead">{{ organismeSiaf?.title }}</span>
          </div>
          <div v-if="hasSiafAssociation || idType === EOrganismeIdType.Rnf" class="flex-row gap-4">
            <div class="flex gap-4">
              <label class="bn-fiche-sub-title--label dark uppercase">SIRET:</label>
              <span class="bn-fiche-sub-title--text">{{ organisme.siret }}</span>
            </div>
            <div class="flex gap-4">
              <label class="bn-fiche-sub-title--label dark uppercase">état:</label>
              <span class="bn-fiche-sub-title--text">{{ organisme.rnfJson?.state }} depuis le {{ dateToStringFr(organisme.rnfJson?.stateEffectiveAt) }}</span>
            </div>
          </div>

          <div class="w-1/6">
            <BnRefreshSyncButton
              :sync-state="syncState"
              @refresh-sync="onRefreshSync"
              @refresh-data="loadOrganisme()"
            />
          </div>
        </div>
      </template>
      <template
        v-if="rnaImportedAt"
        #sub-title
      >
        <span class="italic">Données anti-datées de juin 2023</span>
      </template>
      <template #content>
        <Spinner
          v-if="isSynchronising"
          message="Synchronisation en cours..."
        />
        <div
          v-else-if="isErrorSync"
          class="flex flex-col justify-center items-center p-10"
        >
          <span class="fr-text--lg"
            >Cette {{ idType === EOrganismeIdType.Rna ? 'assocation' : 'fondation' }} n'a pas pu être synchroniser.</span
          >
          <span class="fr-text--lg">Veuillez Contacter le support.</span>
        </div>
        <div
          v-else
          class="w-full h-full pl-4"
        >
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
              v-if="organisme?.persons"
              id="Dirigeants"
              :title="`Dirigeants (${organisme?.persons.length || 0})`"
            >
              <div class="w-[99%] pt-4">
                <FicheOrganismePersons
                  v-if="organisme?.persons"
                  :persons="organisme?.persons.map((person, idx) => ({ ...organisme?.rnfJson?.persons[idx], ...person }))"
                />
              </div>
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
            <!-- <BnTab
              v-if="idType === EOrganismeIdType.Rnf"
              id="historique"
              title="Historique"
            >
              <FicheOrganismeHistorique
                :actual="organisme.rnfJson as IFoundationOutput"
                :history="histories"
                :entity-type="idType"
              />
            </BnTab> -->
            <BnTab
              v-if="dossiersCount"
              id="list-dossier"
              title="Dossiers"
            >
              <ListeDossier
                :organisme-id="organisme?.id"
                :role="role as IRole"
              />
              <!-- </div> -->
              <!-- </div> -->
            </BnTab>
          </BnTabsContainer>
        </div>
      </template>
    </LayoutFiche>
  </div>
</template>
