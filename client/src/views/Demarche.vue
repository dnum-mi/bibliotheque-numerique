<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useDemarcheStore } from '@/stores/demarche'

const demarcheStore = useDemarcheStore()

const title = computed<string>(() => demarcheStore.demarche?.title || '')
const number = computed<string>(() => demarcheStore.demarche?.number || '')
const dossiers = computed<any>(() => demarcheStore.demarche?.dossiers?.nodes || [])

const DateToStringFn = (value:any) => {
  return value
    ? (new Date(value)).toLocaleDateString('fr-FR')
    : ''
}

const headerDossierJson = [
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
    text: 'Détails',
  },
]
const headersDossier = computed<any>(() => headerDossierJson.map(elt => elt.text))
const idDemarche = ref(1)

watch(idDemarche, async (value: number) => {
  await demarcheStore.getDemarche(value)
})

onMounted(async () => {
  await demarcheStore.getDemarche(idDemarche)
})

</script>

<template>
  <div class="title">
    <h1>Démarche {{ number }}</h1>
    <h2>{{ title }}</h2>
    <input v-model="idDemarche">
  </div>

  <DsfrTable
    title="Dossiers"
  >
    <template #header>
      <DsfrTableHeaders :headers="headersDossier" />
    </template>
    <tr
      v-for="dossier in dossiers"
      :key="dossier[headerDossierJson[0].value]"
    >
      <td
        v-for="headerJson in headerDossierJson"
        :key="headerJson.value"
      >
        {{
          headerJson.value
            ? ( headerJson.parseFn
              ? headerJson.parseFn(dossier[headerJson.value])
              : dossier[headerJson.value])
            : ''
        }}
      </td>
    </tr>
  </DsfrTable>
</template>

<style scoped>
  .title {
    text-align: center;
    padding-top: 1em;
  }

</style>
