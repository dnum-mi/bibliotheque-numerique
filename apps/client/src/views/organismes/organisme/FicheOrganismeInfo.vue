<script lang="ts" setup>
import type { DsfrBadgeProps } from '@gouvminint/vue-dsfr'
import { dateToStringFr, getPrefecture } from '@/utils'

import FicheOrganismePersons from './FicheOrganismePersons.vue'
import TooltipAddress from './TooltipAddress.vue'
import type { IOrganismeOutputDto } from '@biblio-num/shared'
import type { OrganismeIdType } from '@/stores'

const props = defineProps<{ organisme: IOrganismeOutputDto; type: OrganismeIdType }>()

const isAddressNotVerified = computed(() => !props.organisme?.siege?.isVerified)
const prefecture = computed<string>(() => getPrefecture(props.organisme?.siege?.prefecture))
const creation = computed(() => dateToStringFr(props.organisme?.dateCreation))
const dissolution = computed(() => dateToStringFr(props.organisme?.dateDissolution ?? undefined))
const modifiedAt = computed(() => dateToStringFr(props.organisme?.updatedAt ?? undefined))
//#region map
const mapCenter = computed(() => props.organisme?.siege?.coordinates)
const zoom = ref(12)
const mapCard = ref<HTMLElement>()
//#endregion map

const objectDescription = computed(() => props.organisme?.objectDescription)
const internationalAction = computed(() => props.organisme?.internationalAction)
const generalInterest = computed(() => props.organisme?.generalInterest)
const dueDate = computed(() =>
  props.organisme?.dueDate ? new Intl.DateTimeFormat('fr-FR').format(new Date(props.organisme?.dueDate)) : 'Illimitée',
)
const stateOfFilingOfAccounts = computed<{
  label: string
  type: DsfrBadgeProps['type']
}>(() =>
  !props.organisme?.missingDeclarationYears?.length
    ? {
        label: 'OK',
        type: 'info',
      }
    : {
        label: 'HORS DELAI',
        type: 'error',
      },
)

const fiscalEndDateAt = computed(() => {
  return (
    props.organisme?.fiscalEndDateAt && new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
    }).format(new Date(props.organisme.fiscalEndDateAt))
  )
})
</script>

<template>
  <div class="py-4">
    <div class="flex gap-2">
      <div class="main-info-container">
        <div class="main-info">
          <div class="grid-col-span-2">
            <label class="bn-fiche-sub-title--label uppercase">Siège Social</label>
            <TooltipAddress :show="isAddressNotVerified" />
            <span class="bn-fiche-sub-title--text">
              {{ organisme?.addressLabel }}
            </span>
          </div>
          <div>
            <label class="bn-fiche-sub-title--label uppercase">PRÉFECTURE</label>
            <span class="bn-fiche-sub-title--text">{{ prefecture }}</span>
          </div>
          <template v-if="organisme?.gestion">
            <div class="grid-col-start-1 grid-col-span-2">
              <label class="bn-fiche-sub-title--label uppercase">Adresse de gestion</label>
              <span class="bn-fiche-sub-title--text">
                {{ organisme.gestion.addressLabel }}
              </span>
            </div>
            <div>
              <label class="bn-fiche-sub-title--label uppercase">Préfecture du gestion</label>
              <span class="bn-fiche-sub-title--text">
                {{ getPrefecture(organisme.gestion.prefecture) }}
              </span>
            </div>
          </template>
          <div class="grid-col-start-1">
            <label class="bn-fiche-sub-title--label uppercase">Téléphone</label>
            <span class="bn-fiche-sub-title--text">{{ organisme?.phoneNumber }}</span>
          </div>
          <div>
            <label class="bn-fiche-sub-title--label uppercase">COURRIEL</label>
            <span class="bn-fiche-sub-title--text">{{ organisme?.email }}</span>
          </div>
          <div class="grid-col-start-1">
            <label class="bn-fiche-sub-title--label uppercase">Création</label>
            <span class="bn-fiche-sub-title--text">{{ creation }}</span>
          </div>
          <div>
            <label class="bn-fiche-sub-title--label uppercase">Modification</label>
            <span class="bn-fiche-sub-title--text">{{ modifiedAt }}</span>
          </div>
          <div v-if="dissolution">
            <label class="bn-fiche-sub-title--label uppercase">Dissolution</label>
            <span class="bn-fiche-sub-title--text">{{ dissolution }}</span>
          </div>
          <div>
            <label class="bn-fiche-sub-title--label uppercase">Date du terme</label>
            <span class="bn-fiche-sub-title--text">
              {{ dueDate }}
            </span>
          </div>
          <div class="grid-col-start-1">
            <label class="bn-fiche-sub-title--label uppercase">Dépôt des comptes</label>
            <DsfrBadge
              no-icon
              small
              :label="stateOfFilingOfAccounts.label"
              :type="stateOfFilingOfAccounts.type"
            />
          </div>
          <div>
            <label class="bn-fiche-sub-title--label uppercase">Date de clôture des comptes</label>
            <span class="bn-fiche-sub-title--text">{{ fiscalEndDateAt }}</span>
          </div>
          <div>
            <label class="bn-fiche-sub-title--label uppercase">Activité à l’international</label>
            <span class="bn-fiche-sub-title--text">
              <template v-if="typeof internationalAction === 'boolean'">
                {{ internationalAction ? 'Oui' : 'Non' }}
              </template>
              <em
                v-else
                class="text-gray-400"
              >
                Non renseigné
              </em>
            </span>
          </div>
          <div
            v-if="objectDescription"
            class="grid-col-span-4"
          >
            <label class="bn-fiche-sub-title--label uppercase">Objet</label>
            <span class="bn-fiche-sub-title--text max-h-20 overflow-auto whitespace-pre-wrap block">
              {{ objectDescription }}
            </span>
          </div>
          <div class="grid-col-span-4">
            <label class="bn-fiche-sub-title--label uppercase">Caractère de l'activité d’intérêt général</label>
            <span class="bn-fiche-sub-title--text max-h-20 overflow-auto whitespace-pre-wrap block">
              <template v-if="generalInterest">
                {{ generalInterest }}
              </template>
              <em
                v-else
                class="text-gray-400"
              >
                Non renseigné
              </em>
            </span>
          </div>
        </div>
      </div>
      <div
        v-if="mapCenter && mapCenter.length"
        class="flex-basis-[30%] flex-shrink-0 flex-grow-0 relative"
      >
        <MapCard
          ref="mapCard"
          :zoom
          :center="mapCenter"
          pin-marker
          style="height: 200px; width: 250px"
        />
        <DsfrButton
          type="button"
          icon="ri-focus-3-line"
          tertiary
          title="Recentrer la carte"
          class="rounded-full self-end absolute top-0 right-0"
          icon-only
          @click="$refs.mapCard.resetCenter(mapCenter)"
        />
      </div>
    </div>
    <div class="p-t-6">
      <FicheOrganismePersons
        v-if="organisme?.persons"
        :persons="organisme?.persons.map((person, idx) => ({ ...organisme?.rnfJson?.persons[idx], ...person }))"
      />
    </div>
  </div>
</template>

<style scoped>
.main-info-container {
  width: 100%;
  container-type: inline-size;
}
.main-info {
  display: grid;
  gap: 1rem;
  --columns: repeat(3, 1fr); /* Définit une variable CSS pour les colonnes */
  grid-template-columns: var(--columns); /* Utilise la variable CSS pour définir les colonnes */
}

@container (min-width: 48rem) {
  .main-info {
    --columns: repeat(4, 1fr);
  }
}
</style>
