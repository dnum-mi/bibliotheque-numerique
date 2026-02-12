<script setup lang="ts">
import type { IPerson } from '@biblio-num/shared'
import MembersTableView from './MembersTableView.vue'
import MembersCardView from './MembersCardView.vue'
import { pluralize } from '@/utils/pluralize'

defineProps<{
  isPersonDataPrivate: boolean
  persons: IPerson[]
}>()

const viewMode = ref<'table' | 'card'>('table')
</script>

<template>
  <div class="fr-container fr-py-4w">
    <div v-if="persons.length === 0">
      <p>Aucun dirigeant n'a été trouvé.</p>
    </div>

    <div v-else>
      <div class="flex flex-col">
        <h2 class="fr-h4">
          {{
            pluralize({
              count: persons.length,
              singular: 'dirigeant',
              plural: 'dirigeants',
            })
          }}
        </h2>

        <p v-if="viewMode === 'table'" class="fr-text--sm text-grey">
          Cliquez sur la vue “Carte” pour accéder aux autres informations : adresse de résidence, qualité du déclarant, nationalité, date et lieu de naissance, infos sur la personne morale, etc.
        </p>

        <div class="fr-grid-row fr-mb-3w">
          <ul class="fr-btns-group fr-btns-group--inline fr-btns-group--sm fr-btns-group--icon-left">
            <li>
              <DsfrButton
                label="Tableau"
                icon="fr-icon-table-line"
                class="fr-m-0"
                :tertiary="viewMode !== 'table'"
                :secondary="viewMode === 'table'"
                @click="viewMode = 'table'"
              />
            </li>
            <li>
              <DsfrButton
                label="Carte"
                icon="fr-icon-list-unordered"
                class="fr-m-0"
                :tertiary="viewMode !== 'card'"
                :secondary="viewMode === 'card'"
                @click="viewMode = 'card'"
              />
            </li>
          </ul>
        </div>
      </div>

      <div v-if="viewMode === 'table'">
        <MembersTableView :persons="persons" />
      </div>

      <div v-else class="flex flex-col gap-y-6">
        <MembersCardView :persons="persons" />
      </div>
    </div>
  </div>
</template>
