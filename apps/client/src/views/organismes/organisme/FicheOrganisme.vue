<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { dateToStringFr, copyCurrentUrlInClipboard } from '@/utils'

import LayoutFiche from '@/components/Layout/LayoutFiche.vue'
import ListeDossier from './ListeDossier.vue'
import OrganismeBadge from '@/components/Badges/OrganismeBadge.vue'
import InfoContact from '@/components/InfoContact.vue'
import { type OrganismeIdType, useOrganismeStore } from '@/stores/organisme'

const props = withDefaults(defineProps<{ id: string; idType: OrganismeIdType }>(), {})

const organismeStore = useOrganismeStore()

const organisme = computed(() => organismeStore.organisme)
const prefecture = computed(
  () => `${organismeStore.organisme?.addressPostalCode?.substring(0, 2) || ''} ${organismeStore.organisme?.addressCityName || ''}`,
)
const creation = computed(() => dateToStringFr(organisme.value?.dateCreation))
const dissolution = computed(() => dateToStringFr(organisme.value?.dateDissolution))

const tabTitles = [
  {
    title: 'Statuts',
    tabId: 'tab-0',
    panelId: 'tab-content-0',
  },
]
const selectedTabIndex = ref(0)

function selectTab (idx: number) {
  selectedTabIndex.value = idx
}

const isLoading = ref(false)
onMounted(async () => {
  isLoading.value = true
  try {
    await organismeStore.loadOrganisme(props.id, props.idType)
  } finally {
    isLoading.value = false
  }
})
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
            tab-list-name="tabs-fiche"
            :tab-titles="tabTitles"
            :initial-selected-index="0"
            class="h-full"
            @select-tab="selectTab"
          >
            <DsfrTabContent
              panel-id="tab-content-0"
              tab-id="tab-0"
              :selected="selectedTabIndex === 0"
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
                  :info="organisme.addressLabel"
                  :email="organisme.email ?? ''"
                  :phone="organisme.phoneNumber ?? ''"
                />
              </div>
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

    <div class="flex-basis-[40%]  overflow-auto  flex  flex-col">
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
        <ListeDossier :organisme-id="organisme.id" />
      </div>
    </div>
  </div>
</template>
