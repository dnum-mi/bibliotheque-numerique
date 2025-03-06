<script lang="ts" setup>
import { organismeTypes } from '@biblio-num/shared'
import type { ISiafRnaOutput, ISiafRnfOutput } from '@biblio-num/shared'
import apiClient from '../../../api/api-client'
import { routeNames } from '../../../router/route-names'
import { EOrganismeIdType } from '../../../stores'
import type { OrganismeIdType } from '../../../stores'

const router = useRouter()
const inputSearch = ref('')
const results = ref<(ISiafRnaOutput | ISiafRnfOutput)[] | undefined>(undefined)

const onSearch = async () => {
  const response = await apiClient.searchOrganisme(inputSearch.value)
  results.value = response.map(({ entity }) => {
    if ('foundationType' in entity && 'websites' in entity) {
      return {
        ...entity,
        originalCreatedAt: new Date(entity.originalCreatedAt),
        createdAt: new Date(entity.createdAt),
        updatedAt: new Date(entity.updatedAt),
      } as unknown as ISiafRnfOutput
    } else {
      return {
        ...entity,
        createdAt: new Date(entity.createdAt),
        updatedAt: new Date(entity.updatedAt),
      } as unknown as ISiafRnaOutput
    }
  })
}

const headers = [
  'Numéro RNA / RNF',
  'Titre',
  'Type',
  'Ville',
  'Code postal',
  'Action',
]

const rows = computed(() => {
  return results?.value?.map((result) => {
    const id = result.id
    const idType: OrganismeIdType = 'foundationType' in result ? EOrganismeIdType.Rnf : EOrganismeIdType.Rna

    const subType = 'foundationType' in result ? result.foundationType || organismeTypes[5] : organismeTypes[5]

    let codePostal = 'N/A'
    let ville = 'N/A'

    if ('foundationType' in result) {
      const entity = result as ISiafRnfOutput
      const address = entity.address?.dsStringValue || ''
      const codePostalMatch = address.match(/\b\d{5}\b/)
      codePostal = codePostalMatch ? codePostalMatch[0] : 'N/A'
      ville = codePostalMatch ? address.split(codePostalMatch[0])[1].trim() : 'N/A'
    } else {
      const entity = result as ISiafRnaOutput
      const addresses = entity.addresses
      if (addresses.length > 0 && addresses[0].rnaAddress?.address) {
        const rnaAddress = addresses[0].rnaAddress.address
        codePostal = rnaAddress.codepostal || 'N/A'
        if ('achemine' in rnaAddress) {
          ville = rnaAddress.achemine || 'N/A'
        }
      }
    }

    return {
      rowData: [
        id,
        result.title,
        {
          component: 'OrganismeBadge',
          type: subType,
        },
        ville,
        codePostal,
        {
          component: 'DsfrButton',
          label: 'Voir',
          icon: 'fr-icon-eye-line',
          onClick: () => {
            router.push({
              name: routeNames.FICHE_ORGANISME,
              params: { id: id as string },
              query: { idType },
            })
          },
        },
      ],
    }
  })
})
</script>

<template>
  <LayoutList
    title="Rechercher dans le référentiel des associations et des fondations"
    title-bg-color="var(--border-plain-grey)"
    title-icon="fr-icon-search-line"
  >
    <div class="p-8">
      <form @submit.prevent="onSearch">
        <DsfrSearchBar
          v-model="inputSearch"
          label="Rechercher un numéro, un titre, une description ..."
          @search="onSearch"
        />
      </form>

      <DsfrTable
        v-if="results?.length"
        class="w-full"
        title="Résultats de la recherche"
        :headers="headers"
        :rows="rows"
      />
    </div>
  </LayoutList>
</template>
