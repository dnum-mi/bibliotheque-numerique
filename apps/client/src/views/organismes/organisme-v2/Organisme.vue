<script setup lang="ts">
import BnTabsContainer from '@/components/BnTabsContainer/BnTabsContainer.vue'
import Spinner from '@/components/Spinner.vue'
import { useOrganismeV2Store } from '@/stores/organisme-v2'
import { storeToRefs } from 'pinia'
import OrganismeOverview from './OrganismeOverview.vue'
import { dateToStringFr, getPrefecture } from '@/utils'
import type { IFoundationOutput } from '@biblio-num/shared'
import OrganismePersons from './OrganismePersons.vue'
import ListeDossier from './ListeDossier.vue'
import ListeEtablissement from './ListeEtablissement.vue'
import ListePieceJointe from './ListePieceJointe.vue'
import ListeRelations from './ListeRelations.vue'
import type { OrganismeIdType } from '@/stores'

const props = withDefaults(defineProps<{ id: string, idType: OrganismeIdType }>(), {})

const organismeStore = useOrganismeV2Store()

const { selectedOrganisme, isLoading, isAssociation } = storeToRefs(organismeStore)

const { fetchOrganisme } = organismeStore

const defaultTabId = computed(() => 'infos')
const currentFicheOrganismeTab = ref<string | undefined>(undefined)

onMounted(async () => {
  await fetchOrganisme(props.id, props.idType)
})
</script>

<template>
  <Spinner v-if="isLoading" />
  <div
    v-else-if="selectedOrganisme"
    class="flex flex-grow gap-2 h-full overflow-hidden"
  >
    <LayoutFiche
      class="overflow-auto"
      title-bg-color="var(--grey-200-850)"
      title-fg-color="var(--text-inverted-grey)"
    >
      <template #title>
        <div>
          <OrganismeBadge
            :type="isAssociation ? 'ASSO' : (selectedOrganisme as IFoundationOutput).foundationType"
            class="mr-4"
            big
          />
          <span class="fr-text--lead fr-text--bold">{{ selectedOrganisme.id }} - </span>
          <span class="fr-text--lead">{{ selectedOrganisme.title }}</span>
        </div>
      </template>
      <template #sub-title>
        <div>
          <div class="fr-grid-row">
            <div class="flex flex-col fr-col-2">
              <label class="text-sm/6 font-medium text-gray-900">Date de création</label>
              <span class="text-sm/6 text-gray-700">{{ dateToStringFr(selectedOrganisme.creationAt) }}</span>
            </div>
            <div class="flex flex-col fr-col-2">
              <label class="text-sm/6 font-medium text-gray-900">Etat de la structure</label>
              <span class="text-sm/6 text-gray-700">
                <OrganismeBadge :type="selectedOrganisme.state" />
              </span>
            </div>
            <div class="flex flex-col fr-col-2">
              <label class="text-sm/6 font-medium text-gray-900">Préfecture</label>
              <span class="text-sm/6 text-gray-700">{{ getPrefecture(selectedOrganisme.department) }}</span>
            </div>
          </div>
        </div>
      </template>
      <template #content>
        <BnTabsContainer
          v-model="currentFicheOrganismeTab"
          :default-tab-id="defaultTabId"
        >
          <BnTab
            id="informations"
            title="Informations"
          >
            <OrganismeOverview :organisme="selectedOrganisme" :is-foundation="!isAssociation" />
          </BnTab>
          <BnTab
            id="dirigeants"
            :title="`Dirigeants (${selectedOrganisme.persons.length})`"
          >
            <OrganismePersons :persons="selectedOrganisme.persons" />
          </BnTab>
          <BnTab
            id="dossiers"
            title="Dossiers"
          >
            <ListeDossier :organisme-id="selectedOrganisme.id" />
          </BnTab>
          <BnTab
            id="relation"
            title="Relations"
          >
            <ListeRelations
              :current-organisme-title="selectedOrganisme.id"
              :founded-legal-entities="selectedOrganisme.foundedLegalEntities"
              :founder-legal-entities="selectedOrganisme.founderLegalEntities"
              :governance-legal-entities="selectedOrganisme.governanceLegalEntities"
              :from-lineage="selectedOrganisme.fromLineage"
              :to-lineage="selectedOrganisme.toLineage"
            />
          </BnTab>
          <BnTab
            id="etablissement"
            title="Établissements"
          >
            <ListeEtablissement />
          </BnTab>
          <BnTab
            id="piece-jointe"
            title="Pièces jointes"
          >
            <ListePieceJointe :files="selectedOrganisme.files" />
          </BnTab>
        </BnTabsContainer>
      </template>
    </LayoutFiche>
  </div>
</template>

<style scoped>
.sub-header {
  background-color: var(--background-alt-blue-france);
  padding-top: 1.5rem;
  padding-inline: 1.5rem;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-default-grey);
}
</style>
