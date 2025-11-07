<script lang="ts" setup>
import type { IPerson, IFoundationOutput } from '@biblio-num/shared'
import FicheOrganismePersons from './FicheOrganismePersons.vue'

type ISiafRnfPersons = IFoundationOutput['persons']
const props = defineProps<{ persons: ISiafRnfPersons }>()

const transformToPerson = (person: ISiafRnfPersons[0]): IPerson => ({
  ...person,
  civility: person?.civility || '',
  bornPlace: person?.bornPlace || '',
  address: {
    label: person.address?.dsAddress?.label || person.address?.oneLine || '',
    type: person.address?.dsAddress?.type || '',
    streetAddress: person.address?.dsAddress?.streetAddress || '',
    streetNumber: person.address?.dsAddress?.streetNumber || '',
    streetName: person.address?.dsAddress?.streetName || '',
    postalCode: person.address?.dsAddress?.postalCode || '',
    departmentName: person.address?.dsAddress?.departmentName || '',
    cityName: person.address?.dsAddress?.cityName || '',
    cityCode: person.address?.dsAddress?.cityCode || '',
    departmentCode: person.address?.dsAddress?.departmentCode || '',
    regionName: person.address?.dsAddress?.regionName || '',
    regionCode: person.address?.dsAddress?.regionCode || '',
  },
  email: person.email || '',
  phone: person.phone || '',
  createdAt: new Date(-1),
  updatedAt: new Date(-1),
})
const persons = computed(() => props.persons.map(transformToPerson))
</script>

<template>
  <FicheOrganismePersons
    v-if="persons"
    :persons="persons"
  />
</template>
