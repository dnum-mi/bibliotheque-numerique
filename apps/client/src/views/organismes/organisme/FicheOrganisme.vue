<script lang="ts" setup>
import { ref, onMounted, computed, ComputedRef } from 'vue'
import { dateToStringFr } from '@/utils'

import LayoutFiche from '@/components/Layout/LayoutFiche.vue'
import ListeDossier from './ListeDossier.vue'
import OrganismeBadge from '@/components/Badges/OrganismeBadge.vue'
import InfoContact from '@/components/InfoContact.vue'
import { OrganismeIdType, useOrganismeStore } from '@/stores/organisme'

import useToaster from '@/composables/use-toaster'
import type { IOrganisme } from '@biblio-num/shared'

const props = withDefaults(defineProps<{ id: string; idType: OrganismeIdType }>(), {})

const organismeStore = useOrganismeStore()

const organisme: ComputedRef<IOrganisme> = computed(() => organismeStore.organisme)
const prefecture = computed(
  () => `${organismeStore.organisme?.addressPostalCode?.substring(0, 2) || ''} ${organismeStore.organisme?.addressCityName || ''}`,
)
const creation = computed(() => dateToStringFr(organismeStore.organisme?.dateCreation))
const dissolution = computed(() => dateToStringFr(organismeStore.organisme?.dateDissolution))

const tabTitles = [
  {
    title: 'Statuts',
    tabId: 'tab-0',
    panelId: 'tab-content-0',
  },
]
const toaster = useToaster()
const currentUrl = ref(window.location.href)
const selectedTabIndex = ref(0)

function selectTab (idx: number) {
  selectedTabIndex.value = idx
}
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(currentUrl.value)
    toaster.addSuccessMessage({ description: 'Le lien a été copié.' })
  } catch (error) {
    toaster.addErrorMessage({ description: "Le lien n'a pas été copié." })
  }
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
    class="fr-grid-row gap-4 min-h-full"
  >
    <LayoutFiche class="fr-p-0 fr-col-6 min-h-full flex flex-column">
      <template #title>
        <OrganismeBadge
          :type="organisme.type"
          big
        />
        <span class="fr-text--lead fr-text--bold">{{ organisme.idRna }} -</span>
        <span class="fr-text--lead">{{ organisme.title }}</span>
      </template>

      <template #sub-title>
        <div class="flex  gap-4">
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
      <div class="flex-grow">
        <DsfrTabs
          tab-list-name="tabs-fiche"
          :tab-titles="tabTitles"
          :initial-selected-index="0"
          @select-tab="selectTab"
        >
          <DsfrTabContent
            panel-id="tab-content-0"
            tab-id="tab-0"
            :selected="selectedTabIndex === 0"
          >
            <div class="bn-list-contact">
              <div class="fr-container">
                <div class="fr-grid-row">
                  <div class="fr-col-12 fr-mb-2w">
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
                    :emails="organisme.email"
                    :phones="organisme.phoneNumber"
                  />
                </div>
              </div>
            </div>
          </DsfrTabContent>
        </DsfrTabs>
      </div>
      <footer class="footer">
        <div class="fr-col-11 fr-col-lg-6 footer-actions mx-auto">
          <DsfrButton
            :style="{ width: '50%' }"
            class="m-4 p-4 flex justify-center"
            label="Copier le lien"
            icon="ri-arrow-go-back-fill"
            :icon-right="true"
            secondary
            @click="copyLink()"
          />
        </div>
      </footer>
    </LayoutFiche>

    <ListeDossier :organisme-id="organisme.id" />
  </div>
</template>

<style scoped>
.footer {
  background-color: #fff;
  text-align: center;
  box-shadow: 0 -4px 16px rgb(0 0 0 / 25%);
}

.footer button {
  width: 50%;
}
</style>
