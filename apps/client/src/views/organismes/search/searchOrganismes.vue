<script lang="ts" setup>
import { organismeTypes, type ISiafAssociationOutput, type ISiafFondationOutput, type ISiafSearchOrganismeResponseOutput } from '@biblio-num/shared'
import apiClient from '../../../api/api-client'
import { routeNames } from '../../../router/route-names'
import { EOrganismeIdType, type OrganismeIdType } from '../../../stores'

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
    const assocation = result.entity as ISiafAssociationOutput
    const fondation = result.entity as ISiafFondationOutput

    const idRna = assocation.identite.id_rna
    const idRnf = fondation.identite.id_rnf
    const id = idRna || idRnf
    const idType: OrganismeIdType = (idRna ? EOrganismeIdType.Rna : EOrganismeIdType.Rnf) satisfies OrganismeIdType
    const subType = fondation.identite.type_fondation || organismeTypes[5]
    const codePostal = idType === EOrganismeIdType.Rna ? assocation.coordonnees.adresse_siege.cp : fondation.coordonnees.adresse.cp
    const ville = idType === EOrganismeIdType.Rna ? assocation.coordonnees.adresse_siege.commune : fondation.coordonnees.adresse.commune
    return {
      rowData: [
        id,
        result.entity.identite.nom,
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
