<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'

import { computed, onMounted } from 'vue'
import { useDemarcheStore } from '@/stores/demarche'
import GroupInstructeurs from '@/views/DemarcheGrpInstructeurs.vue'
import DemarcheService from '@/views/DemarcheService.vue'
import DemarcheInformations from '@/views/DemarcheInformations.vue'
import BiblioNumDataTable from '@/components/BiblioNumDataTableAgGrid.vue'
import { dateToStringFr } from '@/utils/dateToString'
import { stateToFr } from '@/utils/stateToString'
import { booleanToYesNo } from '@/utils/booleanToString'

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
</script>

<template>
  <div class="fr-container">
    <div class="title">
      <h1>Démarche {{ number }}</h1>
      <h2>{{ title }}</h2>
    </div>

    <DemarcheInformations :data-json="demarche?.demarcheDS?.dataJson" />
    <DemarcheService :service="service" />
    <br>
    <GroupInstructeurs :group-instructeurs="groupInstructeurs" />
    <br>
    <BiblioNumDataTable
      title="Dossiers"
      :headers="headerDossierJson"
      :row-data="dossiers"
      with-action="{{true}}"
      @get-elt="getDossier"
    />
  </div>
</template>

<style scoped>
  .title {
    text-align: center;
    padding-top: 1em;
  }

</style>
