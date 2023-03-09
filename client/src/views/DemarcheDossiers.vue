<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'

import { computed, onMounted, ref } from 'vue'
import { useDemarcheStore } from '@/stores/demarche'
import GroupInstructeurs from '@/views/DemarcheGrpInstructeurs.vue'
import DemarcheService from '@/views/DemarcheService.vue'
import DemarcheInformations from '@/views/DemarcheInformations.vue'
import BiblioNumDataTable from '@/components/BiblioNumDataTableAgGrid.vue'
import { dateToStringFr } from '@/utils/dateToString'
import { stateToFr } from '@/utils/stateToString'
import { booleanToYesNo } from '@/utils/booleanToString'
import LayoutList from '@/components/LayoutList.vue'

const route = useRoute()
const router = useRouter()
const demarcheStore = useDemarcheStore()

const title = computed<string>(() => demarcheStore.demarche?.title || '')
const number = computed<string>(() => demarcheStore.demarche?.demarcheDS?.dataJson?.number || '')
const dossiers = computed<object[]>(() => demarcheStore.dossiers?.map(dossier => ({ idBiblioNum: dossier.id, ...dossier.dossierDS?.dataJson })) || [])
const groupInstructeurs = computed<object[]>(() => demarcheStore.demarche?.demarcheDS?.dataJson?.groupeInstructeurs || [])
const service = computed<object>(() => demarcheStore.demarche?.demarcheDS?.dataJson?.service || {})
const demarche = computed<object>(() => demarcheStore.demarche || {})

const headerDossierJson = [
  {
    value: 'idBiblioNum',
  },
  {
    text: 'Numéro',
    value: 'number',
  },
  {
    text: 'Archivé',
    value: 'archived',
    parseFn: booleanToYesNo,
    type: 'boolean',
  },
  {
    text: 'Etat',
    value: 'state',
    parseFn: stateToFr,
    type: 'StateDS',
  },
  {
    text: 'Date de dépot',
    value: 'dateDepot',
    parseFn: dateToStringFr,
    type: 'date',
  },
  {
    text: 'Date de construction',
    value: 'datePassageEnConstruction',
    parseFn: dateToStringFr,
    type: 'date',
  },
  {
    text: "Date d'instruction",
    value: 'datePassageEnInstruction',
    parseFn: dateToStringFr,
    type: 'date',
  },
  {
    text: 'Date de traitement',
    value: 'dateTraitement',
    parseFn: dateToStringFr,
    type: 'date',
  },
  {
    text: 'Association déclarée cultuelle dans télédéclaration loi CRPR ?',
    value: 'annotations',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parseFn: (value:any) => {
      return value ? value[0]?.stringValue : ''
    },
  },
  {
    text: 'Si oui, date d\'entrée en vigueur de la qualité cultuelle',
    value: 'annotations',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parseFn: (value:any) => {
      return value ? value[0]?.stringValue : ''
    },
  },
]

onMounted(async () => {
  const params = route?.params
  const id = Number(params.id)
  if (id) {
    await demarcheStore.getDemarche(id)
    await demarcheStore.getDossiers(id)
  }
})

const getDossier = data => {
  router.push({ name: 'Dossier', params: { id: data.idBiblioNum } })
}

const tabTitles = [
  {
    title: 'Dossiers',
  },
  {
    title: 'Infos',
  },
  {
    title: 'Guides',
  },
]
const selectedTabIndex = ref(0)
function selectTab (idx:number) {
  selectedTabIndex.value = idx
}
</script>

<template>
  <LayoutList>
    <template #title>
      <div class="bn-list-search bn-list-search-dossier">
        <h6 class="bn-list-search-title-dossier fr-p-1w fr-m-0">
          {{ title }} - N° {{ number }}
        </h6>
      </div>
    </template>

    <DsfrTabs
      tab-list-name="tabs-dossier"
      :tab-titles="tabTitles"
      initial-selected-index="0"
      class="fr-pt-5w"
      @select-tab="selectTab"
    >
      <DsfrTabContent
        panel-id="tab-content-0"
        tab-id="tab-0"
        :selected="selectedTabIndex === 0"
      >
        <BiblioNumDataTable
          :headers="headerDossierJson"
          :row-data="dossiers"
          with-action="{{true}}"
          @get-elt="getDossier"
        />
      </DsfrTabContent>
      <DsfrTabContent
        panel-id="tab-content-0"
        tab-id="tab-0"
        :selected="selectedTabIndex === 1"
      >
        <DemarcheInformations
          :data-json="demarche?.demarcheDS?.dataJson"
          class="fr-pt-5w"
        />
        <DemarcheService
          :service="service"
          class="fr-pt-5w"
        />
        <GroupInstructeurs
          :group-instructeurs="groupInstructeurs"
          class="fr-pt-5w"
        />
      </DsfrTabContent>
      <DsfrTabContent
        panel-id="tab-content-0"
        tab-id="tab-0"
        :selected="selectedTabIndex === 2"
      />
    </DsfrTabs>
  </LayoutList>
</template>

<style scoped>
  .fr-tabs__panel {
    padding: 0;
  }
</style>
