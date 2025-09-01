<script lang="ts" setup>
import type { IPerson, ISiafRnfOutput } from '@biblio-num/shared'
import FicheOrganismePersons from './FicheOrganismePersons.vue'

type ISiafRnfPersons = ISiafRnfOutput['persons']
const props = defineProps<{ persons: ISiafRnfPersons }>()

const transformToPerson = (person: ISiafRnfPersons[0]): IPerson => ({
  ...person,
  civility: person?.civility || '',
  bornPlace: person?.bornPlace || '',
  address: {
    label: person.address.dsStringValue || '',
    type: person.address.gouvAddress?.type || person.address.dsAddress?.type || '',
    streetAddress: person.address.gouvAddress?.street || person.address.dsAddress?.streetAddress || '',
    streetNumber: person.address.gouvAddress?.housenumber || person.address.dsAddress?.streetNumber || '',
    streetName: person.address.gouvAddress?.name || person.address.dsAddress?.streetName || '',
    postalCode: person.address.gouvAddress?.postcode || person.address.dsAddress?.postalCode || '',
    departmentName: person.address.dsAddress?.departmentName || '',
    cityName: person.address.dsAddress?.cityName || '',
    cityCode: person.address.dsAddress?.cityCode || '',
    departmentCode: person.address.dsAddress?.departmentCode || '',
    regionName: person.address.dsAddress?.regionName || '',
    regionCode: person.address.dsAddress?.regionCode || '',
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
