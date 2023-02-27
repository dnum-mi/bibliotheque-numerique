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
          <div class="fr-col-2">
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
          <div class="fr-col-2">
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
                :e-mail="eMail"
                :title="name"
                :info="adresse"
                :phones="phonesAdresse"
              />
            </div>
          </div>
        </div>
        <div class="bn-list-contact fr-mb-5w">
          <div class="fr-container">
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
import { dateToStringFr } from '@/utils/dateToString'

const organismeStore = useOrganismeStore()

const numberRNA = computed(() => organismeStore.organisme?.rna_id || '')
const name = computed(() => organismeStore.organisme?.titre || '')
const siegeSocial = computed(() => `${organismeStore.organisme?.adresse_siege?.code_postal || ''} ${organismeStore.organisme?.adresse_siege?.commune || ''}`)
const representant1 = computed(() => organismeStore.organisme?.representant_legaux || '')
const prefecture = computed(() => `${organismeStore.organisme?.adresse_siege?.code_postal?.substring(0, 2) || ''} ${organismeStore.organisme?.adresse_siege?.commune || ''}`)
const creation = computed(() => dateToStringFr(organismeStore.organisme?.date_creation))
const modification = computed(() => dateToStringFr(organismeStore.organisme?.mise_a_jour))
const dissolution = computed(() => dateToStringFr(organismeStore.organisme?.date_dissolution))
const phonesAdresse = computed(() => organismeStore.organisme?.adresse_siege?.phones || [])
const eMail = computed(() => organismeStore.organisme?.email || '')
const adresse = computed(() => `${organismeStore.organisme?.adresse_siege?.complement || ''} ${organismeStore.organisme?.adresse_siege?.numero_voie || ''} ${organismeStore.organisme?.adresse_siege?.type_voie || ''} ${organismeStore.organisme?.adresse_siege?.libelle_voie || ''} ${organismeStore.organisme?.adresse_siege?.code_postal || ''} ${organismeStore.organisme?.adresse_siege?.commune || ''}`)
const representants = computed(() => organismeStore.organisme?.representant_legaux || [])
const tabTitles = [
  {
    title: 'Status',
  },
]

const selectedTabIndex = ref(0)

function selectTab (idx:number) {
  selectedTabIndex.value = idx
}

onMounted(async () => {
  const params = useRoute()?.params
<<<<<<< HEAD
=======
  // const id = Number(params.id)
>>>>>>> 02874f2 (feat: vue ficheOrganisme avec bouchon)
  const id = params.id
  if (id) {
    await organismeStore.loadOrganismebyIdRNA(id)
    console.log(organismeStore.organisme)
  }
})
</script>

<style lang="css" scoped>
.bn-list-contact {
  margin: 0.125rem;
}
.bn-fiche-sub-title--label {
  display: block;
  color: var(--text-mention-grey);
  font-family: 'Marianne';
  font-style: normal;
  font-weight: 700;
  font-size: 0.625rem;
  line-height: 1.25rem;
}
.bn-fiche-sub-title--text {
  font-family: 'Marianne';
  font-style: normal;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.25rem;
}

.bn-icon--blue-france-main-525 {
  background-color: var(--blue-france-main-525);
  border-radius: 100%;
  color: var(--grey-1000-50);
  width: 2rem;
  height: 2rem;
  display: inline-block;
  text-align: center;
}

.bn-icon--blue-france-main-525 > span {
  position: relative;
  top: 0.25rem
}

.bn-icon--pink-macaron-950-active {
  background-color:rgb(252,176,162);
  border-radius: 100%;
  color: var(--grey-1000-50);
  width: 2rem;
  height: 2rem;
  display: inline-block;
  text-align: center;
}
.bn-icon--pink-macaron-950-active > span {
  position: relative;
  top: 0.25rem
}

</style>
