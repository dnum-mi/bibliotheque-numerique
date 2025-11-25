<script lang="ts" setup>
import apiClient from '@/api/api-client'
import LayoutFiche from '@/components/Layout/LayoutFiche.vue'
import ListeDossier from './ListeDossier.vue'
import ListeRelations from './ListeRelations.vue'
import ListeEtablissement from './ListeEtablissement.vue'
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
  IFoundationOutput,
  IAssociationOutput,
  ILegalEntity,
  ILineage,
  ISiafOrganisme,
  IEstablishment,
  IDsEvent,
  // ISiafRnfHistoryOutput,
} from '@biblio-num/shared'
import { dFileTabDictionary, eOrganismeType, eState } from '@biblio-num/shared'
import type { ApiCall } from '@/components/ag-grid/server-side/pagination.utils'
import FicheInfoAssociation from './FicheInfoAssociation.vue'
import FicheOrganismeInfo from './FicheOrganismeInfo.vue'
import slugify from 'slugify'
// import FicheOrganismeHistorique from './historique/FicheOrganismeHistorique.vue'
import BnRefreshSyncButton from '@/components/BnRefreshSyncButton.vue'
import { synchroniseOneOrganisme } from '../../../api/sudo-api-client'
import Spinner from '@/components/Spinner.vue'
import { dateToStringFr } from '@/utils'
import FicheOrganismePersons from './FicheOrganismePersons.vue'

import OrganismeOverview from './components/OrganismeOverview.vue'
import FicheEvents from './FicheEvents.vue'

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

const filesSummary = ref<Record<FileTagKey, number> | Record<string, never>>({})

// TODO: Remettre plus tard pour le siaf final
// const dsEvents = ref<IDsEvent<IFoundationOutput> | null>(null)
const dsEvents = computed<IDsEvent<IFoundationOutput> | null>(() => organisme.value.rnfJson?.events || null)
// TODO: use router to prevent user to access this page if not logged in or without the right role
const role = computed<IRole | undefined>(() => userStore.currentUser?.role)

const isLoading = ref(false)

const loadOrganisme = async () => {
  await organismeStore.loadOrganisme(props.id, props.idType)
  if (organisme.value) {
    // TODO: Remettre plus tard pour le siaf final
    // dsEvents.value = await organismeStore.loadOrganismeEvents(props.id, props.idType)
    filesSummary.value = await apiClient.getOrganismeFilesSummary(organisme.value.id)
  }
}

const isSynchronising = computed(() => {
  return (
    (syncState.value?.state === eState.uploading || syncState.value?.state === eState.queued)
    && organisme.value?.type === eOrganismeType.unknown
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

watch(() => props.id, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    isLoading.value = true
    // dsEvents.value = null
    filesSummary.value = {}

    await loadOrganisme()

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
      count,
    }
  }).filter(f => f.count > 0)
})

const serviceInstructor = computed(() => {
  const events = dsEvents.value?.events

  if (!events || events.length === 0) {
    return null
  }

  const sortedEvents = [...events].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return sortedEvents[0]?.dossierInstructeurGroup ?? null
})

// onUpdated(() => {
//   console.log(fileTabs.value)
// })

const onRefreshSync = async () => {
  await synchroniseOneOrganisme(organisme.value.id)
}

type relationsType = {
  founderLegalEntities: ILegalEntity[]
  foundedLegalEntities: ILegalEntity[]
  governanceLegalEntities: ILegalEntity[]
  fromLineage: ILineage | null
  toLineage: ILineage | null
}

const relations = computed<relationsType | undefined>(() => {
  const rawJson = (organisme.value?.rnfJson || organisme.value?.rnaJson) as ISiafOrganisme | undefined

  if (!rawJson) {
    return undefined
  }

  const founderLegalEntities = rawJson.founderLegalEntities || []
  const foundedLegalEntities = rawJson.foundedLegalEntities || []
  const governanceLegalEntities = rawJson.governanceLegalEntities || []
  const fromLineage = rawJson.fromLineage || null
  const toLineage = rawJson.toLineage || null

  const hasData = founderLegalEntities.length > 0
    || foundedLegalEntities.length > 0
    || governanceLegalEntities.length > 0
    || fromLineage !== null
    || toLineage !== null

  return hasData
    ? {
        founderLegalEntities,
        foundedLegalEntities,
        governanceLegalEntities,
        fromLineage,
        toLineage,
      }
    : undefined
})

type EstablishmentsType = {
  secondaryEstablishments: IEstablishment[]
  acquiredEstablishments: IEstablishment[]
  cededEstablishments: IEstablishment[]
}
const establishments = computed<EstablishmentsType | undefined>(() => {
  const rnaJson = organisme.value?.rnaJson as IAssociationOutput | undefined
  if (!rnaJson) {
    return undefined
  }

  const secondary = rnaJson.secondaryEstablishments || []
  const acquired = rnaJson.acquiredEstablishments || []
  const ceded = rnaJson.cededEstablishments || []

  const hasData = secondary.length > 0 || acquired.length > 0 || ceded.length > 0

  return hasData
    ? {
        secondaryEstablishments: secondary,
        acquiredEstablishments: acquired,
        cededEstablishments: ceded,
      }
    : undefined
})

const rawJson = computed<IFoundationOutput | IAssociationOutput>(() => organisme?.value?.rnfJson as IFoundationOutput || organisme.value?.rnaJson as IAssociationOutput)
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
              <label class="bn-fiche-sub-title--label dark uppercase">Crée le:</label>
              <span class="bn-fiche-sub-title--text">{{ dateToStringFr(organisme.dateCreation) }}</span>
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
          <span class="fr-text--lg">Cette {{ idType === EOrganismeIdType.Rna ? 'assocation' : 'fondation' }} n'a pas pu être synchroniser.</span>
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
              <OrganismeOverview
                v-if="idType === 'Rnf'"
                :organisme="rawJson"
                :is-foundation="idType === 'Rnf'"
                :missing-declaration-years="organisme?.missingDeclarationYears"
                :service-instructor="serviceInstructor!"
              />
              <FicheOrganismeInfo
                v-else
                :organisme="organisme"
                :type="idType"
              />
            </BnTab>
            <BnTab
              v-if="organisme?.persons.length"
              id="Dirigeants"
              :title="`Dirigeants (${organisme?.persons.length || 0})`"
            >
              <div class="w-[99%] pt-4">
                <FicheOrganismePersons
                  v-if="organisme?.persons"
                  :persons="organisme?.persons.map((person, idx) => ({ ...organisme?.rnfJson?.persons[idx], ...person }))"
                  :is-person-data-private="rawJson?.isPersonDataPrivate"
                />
              </div>
            </BnTab>
            <BnTab
              v-if="establishments"
              id="Etablissements"
              title="Etablissements"
            >
              <ListeEtablissement
                :secondary-establishments="establishments?.secondaryEstablishments"
                :acquired-establishments="establishments?.acquiredEstablishments"
                :ceded-establishments="establishments?.cededEstablishments"
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
              v-if="dsEvents && dsEvents.events.length > 0 && idType === EOrganismeIdType.Rnf"
              id="events"
              :title="`Évènements (${dsEvents.events.length})`"
            >
              <FicheEvents
                :events="dsEvents?.events"
              />
            </BnTab>
            <BnTab
              v-if="relations"
              id="relations"
              title="Relations"
            >
              <ListeRelations
                :current-organisme-title="organisme.title ?? 'Sans titre'"
                :founded-legal-entities="relations?.foundedLegalEntities"
                :founder-legal-entities="relations?.founderLegalEntities"
                :governance-legal-entities="relations?.governanceLegalEntities"
                :from-lineage="relations?.fromLineage"
                :to-lineage="relations?.toLineage"
              />
            </BnTab>
            <BnTab
              v-if="dossiersCount"
              id="list-dossier"
              :title="`Dossiers (${dossiersCount})`"
            >
              <ListeDossier
                :organisme-id="organisme?.id"
                :role="role as IRole"
              />
            </BnTab>
            <BnTab
              v-if="role?.label === 'sudo'"
              id="Tech"
              title="Tech"
            >
              <pre>{{ (rawJson || {}) }}</pre>
            </BnTab>
          </BnTabsContainer>
        </div>
      </template>
    </LayoutFiche>
  </div>
</template>
