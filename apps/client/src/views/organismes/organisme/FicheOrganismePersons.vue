<script lang="ts" setup>
import {
  type IPerson,
  ePersonRole,
} from '@biblio-num/shared'
import { DsfrAccordion } from '@gouvminint/vue-dsfr'
import { dateToStringFr } from '../../../utils'

const props = defineProps<{ persons: IPerson[] }>()

const creatorRoleKey = 'CREATOR'
const roleDictionary = {
  [creatorRoleKey]: 'Fondateurs',
  [ePersonRole.MEMBER_BOARD_DIRECTOR]: 'Conseillers d\'administration',
  [ePersonRole.MEMBER_ADVISORY_COMMITTEE]: 'Membres du comité consultatif',
  [ePersonRole.FUND_EMPLOYEE]: 'Employés',
  [ePersonRole.NOT_SPECIFIED]: 'Autres',
}
const roleDictionaryKey = Object.keys(roleDictionary)
type TPersonOrganisme = IPerson & { fullName: string }
type TPersonByRole = {
  role: string,
  persons: TPersonOrganisme[]
}

const personsByRoles = computed<TPersonByRole[]>(() =>
  Object.entries(roleDictionary).map(([roleKey, roleValue]) => ({
    role: roleValue,
    persons: props.persons.filter(p => (
      roleKey === creatorRoleKey
        ? p.isFounder
        : (p.role === roleKey)
        || (roleKey === ePersonRole.NOT_SPECIFIED
        && !(p.role && roleDictionaryKey.includes(p.role)))
    ))
      .map(person => ({
        ...person,
        fullName: `${person.firstName} ${person.lastName}`,
      })),
  }))
    .filter(({ persons }) => persons.length),
)

const expandedIds = ref<string[]>([])
const onExpand = (idx: number, id: string) => {
  expandedIds.value[idx] = id
}
</script>

<template>
  <ul class="fr-accordions-group">
    <li
      v-for="(personsByRole, idx) in personsByRoles"
      :key="`peson-by-role-${idx}`"
    >
      <DsfrAccordion
        :id="`peson-expanded-${idx}`"
        :expanded-id="expandedIds[idx]"
        @expand="onExpand(idx, $event as string)"
      >
        <template #title>
          <div class="fr-mr-2w bn-icon--pink-macaron-950-active">
            <span
              class="fr-icon-group-line"
              aria-hidden="true"
            />
          </div>
          <span class="fr-text fr-text--bold">
            {{ personsByRole.role }}
          </span>
        </template>
        <div
          v-for="(person, idx1) in personsByRole.persons"
          :key="`person-${idx1}`"
          class="p-t-6"
        >
          <div class="fr-container w-full pl-0! pr-0! text-sm">
            <div class="fr-grid-row w-full">
              <div class="fr-col-6 pr-2">
                <label class="fr-text--bold block">{{ person.fullName }}</label>
                <span class="">Née le {{ dateToStringFr(person.bornAt) }} à {{ person.bornPlace }}</span>
              </div>
              <div class="fr-col-3 pr-2">
                <label class="fr-text--bold block"> Téléphone </label>
                <span class="">
                  {{ person.phone }}
                </span>
              </div>

              <div class="fr-col-3 pr-2">
                <label class="fr-text--bold block">Courriel</label>
                <span class="">
                  {{ person.email }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DsfrAccordion>
    </li>
  </ul>
</template>

<style scoped>
  h3 {
    font: 1em sans-serif;
  }
</style>
