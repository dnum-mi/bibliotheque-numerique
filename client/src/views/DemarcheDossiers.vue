<script lang="ts" setup>
import { useRoute } from 'vue-router'

import { computed, onMounted, ref, watch } from 'vue'
import { useDemarcheStore } from '@/stores/demarche'
import GroupInstructeurs from '@/views/DemarcheGrpInstructeurs.vue'
import DemarcheService from '@/views/DemarcheService.vue'
import DemarcheInformations from '@/views/DemarcheInformations.vue'
import BliblioNumDataTable from '@/components/BliblioNumDataTable.vue'

const demarcheStore = useDemarcheStore()

const title = computed<string>(() => demarcheStore.demarche?.title || '')
const number = computed<string>(() => demarcheStore.demarche?.number || '')
const dossiers = computed<any>(() => demarcheStore.dossiers?.map(dossier => ({ idBiblioNum: dossier.id, ...dossier.dossierDS.dataJson })) || [])
const groupInstructeurs = computed<any[]>(() => demarcheStore.demarche?.groupeInstructeurs || '')
const service = computed<any>(() => demarcheStore.demarche?.service || '')
const demarche = computed<any>(() => demarcheStore.demarche || '')

const DateToStringFn = (value:any) => {
  return value
    ? (new Date(value)).toLocaleDateString('fr-FR')
    : ''
}

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
    parseFn: (value:any) => value ? 'Oui' : 'Non',
  },
  {
    text: 'Etat',
    value: 'state',
    parseFn: (value:any) => {
      return {
        accepte: 'Acceptée',
        en_construction: 'En construction',
      }[value]
    },
  },
  {
    text: 'Date de dépot',
    value: 'dateDepot',
    parseFn: DateToStringFn,
  },
  {
    text: 'Date de construction',
    value: 'datePassageEnConstruction',
    parseFn: DateToStringFn,
  },
  {
    text: "Date d'instruction",
    value: 'datePassageEnInstruction',
    parseFn: DateToStringFn,
  },
  {
    text: 'Date de traitement',
    value: 'dateTraitement',
    parseFn: DateToStringFn,
  },
  {
    text: 'Association déclarée cultuelle dans télédéclaration loi CRPR ?',
    value: 'annotations',
    parseFn: (value:any) => {
      return value ? value[0]?.stringValue : ''
    },
  },
  {
    text: 'Si oui, date d\'entrée en vigueur de la qualité cultuelle',
    value: 'annotations',
    parseFn: (value:any) => {
      return value ? value[0]?.stringValue : ''
    },
  },
]
// const headersDossier = computed<any>(() => headerDossierJson.map(elt => elt.text))
const idDemarche = ref(1)

watch(idDemarche, async (value: number) => {
  await demarcheStore.getDemarche(value)
  await demarcheStore.getDossiers(value)
})

onMounted(async () => {
  // const { id } = useRoute().params
  const params = useRoute()?.params
  if (params && params.id) { idDemarche.value = Number(params.id) }
  await demarcheStore.getDemarche(idDemarche.value)
  await demarcheStore.getDossiers(idDemarche.value)
})

</script>

<template>
  <div class="title">
    <h1>Démarche {{ number }}</h1>
    <h2>{{ title }}</h2>
    <!--TODO: input a retirer-->
    <input v-model="idDemarche">
  </div>

  <DemarcheInformations :datas="demarche" />
  <DemarcheService :service="service" />
  <br>
  <GroupInstructeurs :group-instructeurs="groupInstructeurs" />
  <br>
  <BliblioNumDataTable
    title="Dossiers"
    :headers="headerDossierJson"
    :datas="dossiers"
  />
</template>

<style scoped>
  .title {
    text-align: center;
    padding-top: 1em;
  }

</style>
