<template>
  <LayoutFiche>
    <template #title>
      <bn-badge-type-organisme />
      <span class="fr-text--lead fr-text--bold">{{ numberRNA }} -</span> <span class="fr-text--lead">{{ name }}</span>
    </template>

    <template #sub-title>
      <div class="fr-container">
        <div class="fr-grid-row">
          <div class="fr-col-2">
            <label class="bn-fiche-sub-title--label ">SIÈGE SOCIAL</label>
            <span class="bn-fiche-sub-title--text">{{ siegeSocial }}</span>
          </div>
          <div
            v-if="representant1"
            class="fr-col-2"
          >
            <label class="bn-fiche-sub-title--label">REPRÉSENTANT 1</label>
            <span class="bn-fiche-sub-title--text">{{ representant1 }}</span>
          </div>
          <div class="fr-col-2">
            <label class="bn-fiche-sub-title--label">PRÉFECTURE</label>
            <span class="bn-fiche-sub-title--text">{{ prefecture }}</span>
          </div>
          <div class="fr-col-2">
            <label class="bn-fiche-sub-title--label">CRÉATION</label>
            <span class="bn-fiche-sub-title--text">{{ creation }}</span>
          </div>
          <div class="fr-col-2">
            <label class="bn-fiche-sub-title--label">MODIFICATION</label>
            <span class="bn-fiche-sub-title--text">{{ modification }}</span>
          </div>
          <div
            v-if="dissolution"
            class="fr-col-2"
          >
            <label class="bn-fiche-sub-title--label">DISSOLUTION</label>
            <span class="bn-fiche-sub-title--text">{{ dissolution }}</span>
          </div>
        </div>
      </div>
    </template>

    <DsfrTabs
      tab-list-name="tabs-fiche"
      :tab-titles="tabTitles"
      initial-selected-index="0"
      @select-tab="selectTab"
    >
      <DsfrTabContent
        panel-id="tab-content-0"
        tab-id="tab-0"
        :selected="selectedTabIndex === 0"
      >
        <div class="bn-list-contact fr-mb-5w">
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

              <info-contact
                :name="name"
                :info="adress"
                :emails="emails"
                :phones="phoneNumbers"
              />
            </div>
          </div>
        </div>
        <div class="bn-list-contact fr-mb-5w">
          <div
            v-if="representants.length"
            class="fr-container"
          >
            <div class="fr-grid-row">
              <div class="fr-col-12 fr-mb-2w">
                <div class="fr-mr-2w bn-icon--pink-macaron-950-active">
                  <span
                    class="fr-icon-group-line"
                    aria-hidden="true"
                  />
                </div>
                <span class="fr-text fr-text--bold">
                  Représentant.e.s légaux
                </span>
              </div>

              <info-contact
                v-for="(representant, index) in representants"
                :key="index"
                :e-mail="representant.email"
                :title="representant.titre"
                :info="representant.nomComplet"
                :phones="representant.phones"
              />
            </div>
          </div>
        </div>
      </DsfrTabContent>
    </DsfrTabs>
  </LayoutFiche>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'

import LayoutFiche from '@/components/LayoutFiche.vue'
import bnBadgeTypeOrganisme from '@/components/BadgeTypeOrganisme.vue'
import infoContact from '@/components/InfoContact.vue'
import { useOrganismeStore } from '@/stores/organisme'
import { useRoute } from 'vue-router'
import { dateToStringFr } from '@/utils'

const organismeStore = useOrganismeStore()

const numberRNA = computed(() => organismeStore.organisme?.idRef || '')
const name = computed(() => organismeStore.organisme?.title || '')
const siegeSocial = computed(() => `${organismeStore.organisme?.zipCode || ''} ${organismeStore.organisme?.city || ''}`)
const prefecture = computed(() => `${organismeStore.organisme?.zipCode?.substring(0, 2) || ''} ${organismeStore.organisme?.city || ''}`)
const creation = computed(() => dateToStringFr(organismeStore.organisme?.dateCreation))
const modification = computed(() => dateToStringFr(organismeStore.organisme?.dateModification))
const dissolution = computed(() => dateToStringFr(organismeStore.organisme?.dateDissolution))
const phoneNumbers = computed(() => organismeStore.organisme?.phoneNumbers || [])
const emails = computed(() => organismeStore.organisme?.emails || [])
const adress = computed(() => organismeStore.organisme?.address)
const representant1 = computed(() => organismeStore.organisme?.representants_legaux?.[0] || '')
const representants = computed(() => organismeStore.organisme?.representants_legaux || [])
const tabTitles = [
  {
    title: 'Statuts',
  },
]

const selectedTabIndex = ref(0)

function selectTab (idx:number) {
  selectedTabIndex.value = idx
}

onMounted(async () => {
  const params = useRoute()?.params
  if (params?.id) {
    await organismeStore.loadOrganismeByIdRNA(params.id as string)
  }
})
</script>
@/utils/date-to-string
