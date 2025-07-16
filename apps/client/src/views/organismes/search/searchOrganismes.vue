<script lang="ts" setup>
import { organismeTypes, EEntityTypeSearchOrganisme } from '@biblio-num/shared'
import type {
  ISiafAssociationEntity,
  ISiafFondationEntity,
  ISiafSearchOrganismeResponseOutput,
} from '@biblio-num/shared'
import apiClient from '../../../api/api-client'
import { routeNames } from '../../../router/route-names'
import { EOrganismeIdType } from '../../../stores'
import type { OrganismeIdType } from '../../../stores'

const router = useRouter()
const inputSearch = ref('')
const results = ref<ISiafSearchOrganismeResponseOutput[] | undefined>(undefined)
const onSearch = async () => {
  results.value = await apiClient.searchOrganisme(inputSearch.value)
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
    const id = result.entity.id
    const idType: OrganismeIdType
      = (result.entity_type as EEntityTypeSearchOrganisme) === EEntityTypeSearchOrganisme.Fondation
        ? EOrganismeIdType.Rnf
        : EOrganismeIdType.Rna

    const subType
      = result.entity_type === EEntityTypeSearchOrganisme.Fondation
        ? (result.entity as ISiafFondationEntity).foundationType || organismeTypes[5]
        : organismeTypes[5]

    let codePostal = 'N/A'
    let ville = 'N/A'

    if (result.entity_type === 'fondation') {
      const entity = result.entity as ISiafFondationEntity
      const address = entity.address?.dsStringValue || ''
      const codePostalMatch = address.match(/\b\d{5}\b/)
      codePostal = codePostalMatch ? codePostalMatch[0] : 'N/A'
      ville = codePostalMatch ? address.split(codePostalMatch[0])[1].trim() : 'N/A'
    } else if (result.entity_type === 'association') {
      const entity = result.entity as ISiafAssociationEntity
      const addresses = entity.addresses

      if (addresses.length > 0 && addresses[0].rnaAddress?.address) {
        const rnaAddress = addresses[0].rnaAddress.address
        codePostal = rnaAddress.codepostal || 'N/A'
        ville = rnaAddress.achemine || 'N/A'
      }
    }

    return {
      rowData: [
        id,
        result.entity.title,
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
          onClick: async () => {
            console.log('__TEST__', idType, id)
            if (idType === EOrganismeIdType.Rnf) {
              await apiClient.addOneRnf(id as string)
            }
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
    title="Rechercher dans le reférentiel des assocations et des fondations "
    title-bg-color="var(--border-plain-grey)"
    title-icon="fr-icon-search-line"
  >
    <div class="p-8">
      <form @submit.prevent="onSearch">
        <DsfrSearchBar
          v-model="inputSearch"
          label="Recherche un numéro, un titre, une description ..."
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
