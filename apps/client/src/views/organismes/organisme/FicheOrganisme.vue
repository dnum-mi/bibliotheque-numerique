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
} from '@biblio-num/shared'
import { dFileTabDictionary, eOrganismeType } from '@biblio-num/shared'
import type { ApiCall } from '@/components/ag-grid/server-side/pagination.utils'
import FicheInfoAssociation from './FicheInfoAssociation.vue'
import FicheInfoFondation from './FicheInfoFondation.vue'
import FicheOrganismeInfo from './FicheOrganismeInfo.vue'

const props = withDefaults(defineProps<{ id: string; idType: OrganismeIdType }>(), {})

const organismeStore = useOrganismeStore()
const userStore = useUserStore()

const organisme = computed(() => organismeStore.organisme as IOrganismeOutputDto)
const organismeSiaf = computed(() => organismeStore.organismeSiaf)
const hasSiaf = computed(() => !!organismeStore.organismeSiaf)
const hasSiafAssociation = computed(() => {
  const organisme = organismeSiaf.value as IOrganismeOutputDto | undefined
  return !!(organisme && organisme.type === eOrganismeType.ASSO)
})
const hasSiafFoundation = computed(() => {
  const organisme = organismeSiaf.value as IOrganismeOutputDto | undefined
  const types = [eOrganismeType.FDD, eOrganismeType.FE, eOrganismeType.FRUP]
  return !!(organisme && types.includes(organisme.type as typeof types[number]))
})

const filesSummary = ref<Record<FileTagKey, number> | Record<string, never>>({})

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

const fetchAttachedFiles: ApiCall<IFileOutput> = (params: IPagination<IFileOutput>) => {
  if (organisme.value) {
    return apiClient.getOrganismeFiles(organisme.value.id)(params)
  }
}

// TODO: A factoriser BEGIN
const selectedTabIndex = ref(hasSiafAssociation.value ? 0 : 1)
const tabTitles = computed<{ value: number, label: string }[]>(() => {
  let headers = []

  if (hasSiafAssociation.value) {
    headers.push({
      label: 'RAF',
      value: 0,
    })
  }

  if (organisme.value) {
    headers = headers.concat([
      {
        label: 'Infos',
        value: 1,
      },
      ...Object.entries(filesSummary.value).map(([tag, count], index: number) => {
        return {
          label: `${dFileTabDictionary[tag as FileTagKey]} (${count})`,
          value: index + 2,
        }
      }),
    ])
  }
  return headers
})

// TODO: A factoriser END
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
          :type="(organismeSiaf as IOrganismeOutputDto)?.type"
          class="mr-4"
          big
        />
        <span class="fr-text--lead fr-text--bold">{{ (organismeSiaf as ISiafAssociationOutput)?.identite?.id_rna || (organismeSiaf as IOrganismeOutputDto)?.idRnf }} - </span>
        <span class="fr-text--lead">{{ (organismeSiaf as ISiafAssociationOutput)?.identite?.nom || (organismeSiaf as IOrganismeOutputDto).title }}</span>
      </template>

      <template #content>
        <div class="w-full h-full pl-4">
          <!-- TODO à factoriser BEGIN -->
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
              <template
                v-if="hasSiafAssociation"
              >
                <div
                  v-show="selectedTabIndex === 0"
                  class="flex-grow bn-scroll-parent fr-pt-2w"
                >
                  <FicheInfoAssociation v-if="idType === EOrganismeIdType.Rna" :organisme-raf="(organismeSiaf as IOrganismeOutputDto)" />
                </div>
              </template>
            </Transition>

            <Transition
              name="slide-fade"
              mode="in-out"
            >
              <div
                v-show="selectedTabIndex === 1"
                class="flex-grow bn-scroll-parent fr-pt-2w"
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
              </div>
            </Transition>

            <Transition
              v-for="(tag, idx) in Object.keys(filesSummary)"
              :key="tag"
              name="slide-fade"
              mode="in-out"
            >
              <div
                v-show="selectedTabIndex === idx + 2"
                class="flex-grow bn-scroll-parent fr-pt-2w"
              >
                <AttachedFileList
                  :key="tag"
                  class="h-full"
                  :fetch-attached-files="fetchAttachedFiles"
                  :tag="tag"
                  :active="selectedTabIndex === idx + 2"
                />
              </div>
            </Transition>
          </div>

        <!-- TODO à factoriser END -->
        </div>
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

<style scoped>
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
