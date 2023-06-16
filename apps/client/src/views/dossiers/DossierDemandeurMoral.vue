<script lang="ts" setup>
import DisplayLabelsValues from '@/components/DisplayLabelsValues.vue'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
    datas?: object
  }>(), {
  datas: () => ({}),
})

const title = 'DemandeurDossier'
const labelsDemandeur = [
  {
    text: 'Siret',
    value: 'siret',
  },
  {
    text: 'Siege Social',
    value: 'siegeSocial',
  },
  {
    text: 'Code NAF',
    value: 'naf',
  },
  {
    text: 'Libellé NAF',
    value: 'libelleNaf',
  },
]

const labelsAdresses = [
  {
    text: 'Nom',
    value: 'label',
  },
  {
    text: "Type d'adresse",
    value: 'type',
  },
  {
    text: 'Rue',
    value: 'streetAddress',
  },
  {
    text: 'Numéro de rue',
    value: 'streetNumber',
  },
  {
    text: 'Nom de rue',
    value: 'streetName',
  },
  {
    text: 'Code postale',
    value: 'postalCode',
  },
  {
    text: 'Ville',
    value: 'cityName',
  },
  {
    text: 'Code de la ville',
    value: 'cityCode',
  },
  {
    text: 'Departement',
    value: 'departmentName',
  },
  {
    text: 'Code de département',
    value: 'departmentCode',
  },
  {
    text: 'Région',
    value: 'regionName',
  },
  {
    text: 'Code de la région',
    value: 'regionCode',
  },
]

const labelsEntreprise = [
  {
    text: 'Siren',
    value: 'siren',
  },
  {
    text: 'Capital social',
    value: 'capitalSocial',
  },
  {
    text: 'Numero TVA Intracommunautaire',
    value: 'numeroTvaIntracommunautaire',
  },
  {
    text: 'Forme Juridique',
    value: 'formeJuridique',
  },
  {
    text: 'Forme juridique code',
    value: 'formeJuridiqueCode',
  },
  {
    text: 'Nom commercial',
    value: 'nomCommercial',
  },
  {
    text: 'Raison sociale',
    value: 'raisonSociale',
  },
  {
    text: 'Siret siege social',
    value: 'siretSiegeSocial',
  },
  {
    text: 'Code effectif entreprise',
    value: 'codeEffectifEntreprise',
  },
  {
    text: 'Date de création',
    value: 'dateCreation',
  },
  {
    text: 'Nom',
    value: 'nom',
  },
  {
    text: 'Prénom',
    value: 'prenom',
  },
  {
    text: 'Attestation fiscal',
    value: 'attestationFiscaleAttachment',
  },
  {
    text: 'Attestation Social',
    value: 'attestationSocialeAttachment',
  },

]

const labelAsssociation = [

  {
    text: 'Date de création',
    value: 'dateCreation',
  },
  {
    text: 'Date de déclaration',
    value: 'dateDeclaration',
  },
  {
    text: 'Date de publication',
    value: 'datePublication',
  },
  {
    text: 'Objet',
    value: 'objet',
  },
  {
    text: 'Numéro de RNA',
    value: 'rna',
  },
  {
    text: 'Titre',
    value: 'titre',
  },

]

const address = computed(() => props.datas?.address || {})
const entreprise = computed(() => props.datas?.entreprise || {})
const association = computed(() => props.datas?.association || {})

</script>

<template>
  <div class="fr-container">
    <DisplayLabelsValues
      :title="title"
      prefix-id="dossier-demandeur"
      :datas="datas"
      :labels="labelsDemandeur"
      class="fr-pb-3v"
    />
    <h4>Adresse:</h4>
    <DisplayLabelsValues
      :title="title"
      prefix-id="dossier-demandeur"
      :datas="address"
      :labels="labelsAdresses"
      class="fr-pb-3v"
    />
    <h4>Entreprise:</h4>
    <DisplayLabelsValues
      :title="title"
      prefix-id="dossier-demandeur"
      :datas="entreprise"
      :labels="labelsEntreprise"
      class="fr-pb-3v"
    />
    <h4>Association:</h4>
    <DisplayLabelsValues
      :title="title"
      prefix-id="dossier-demandeur"
      :datas="association"
      :labels="labelAsssociation"
      class="fr-pb-3v"
    />
  </div>
</template>
