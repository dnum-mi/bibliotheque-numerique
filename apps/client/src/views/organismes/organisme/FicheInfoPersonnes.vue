<script lang="ts" setup>
import type { IPersonne, PersonRoleKey } from '@biblio-num/shared'
import FicheOrganismePersons from './FicheOrganismePersons.vue'

const props = defineProps<{ personnes: IPersonne[] }>()
const transformToPerson = (personne: IPersonne): IPerson => ({
  civility: personne.civilite,
  lastName: personne.nom,
  firstName: personne.prenom,
  profession: personne.profession,
  nationality: personne.nationalite,
  bornAt: new Date(personne.date_naissance),
  bornPlace: personne.lieu_naissance,
  isFounder: personne.fondateur,
  address: {
    label: personne.adresse.label,
    type: personne.adresse.type_voie,
    streetAddress: personne.adresse.voie,
    streetNumber: personne.adresse.num_voie,
    streetName: personne.adresse.voie,
    postalCode: personne.adresse.cp,
    departmentName: personne.adresse.commune,
    cityName: '',
    cityCode: '',
    departmentCode: '',
    regionName: '',
    regionCode: '',
  },
  email: '',
  phone: '',
  createdAt: new Date(-1),
  updatedAt: new Date(-1),
  role: personne.role as PersonRoleKey,
})
const persons = computed(() => props.personnes.map(transformToPerson))
</script>

<template>
  <FicheOrganismePersons
    v-if="persons"
    :persons="persons"
  />
</template>
