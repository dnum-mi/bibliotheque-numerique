<script lang="ts" setup>
import { type IPerson, ePersonRole } from '@biblio-num/shared'
import { DsfrAccordion } from '@gouvminint/vue-dsfr'
import { dateToStringFr } from '../../../utils'
import TooltipAddress from './TooltipAddress.vue'

const props = defineProps<{ persons: IPerson[] }>()

const creatorRoleKey = 'CREATOR'
const roleDictionary = {
  [creatorRoleKey]: 'Fondateurs',
  [ePersonRole.MEMBER_BOARD_DIRECTOR]: 'Personne exerçant des fonctions d\'administrateur',
  [ePersonRole.MEMBER_SUPERVIROY_BOARD]: 'Personne exerçant des fonctions de surveillance',
  [ePersonRole.MEMBER_MANAGEMENT_BOARD]: 'Personne exerçant des fonctions de direction',
  [ePersonRole.PERSON_IN_DIRECTOR_POSITION]: 'Personne exerçant des fonctions de direction',
  [ePersonRole.NOT_SPECIFIED]: 'Autres',
}
const roleDictionaryKey = Object.keys(roleDictionary)
type TPersonOrganisme = IPerson & { fullName: string }
type TPersonByRole = {
  role: string
  persons: TPersonOrganisme[]
}

const personsByRoles = computed<TPersonByRole[]>(() =>
  Object.entries(roleDictionary)
    .map(([roleKey, roleValue]) => ({
      role: roleValue,
      persons: props.persons
        .filter((p) =>
          roleKey === creatorRoleKey
            ? p.isFounder
            : p.role === roleKey || (roleKey === ePersonRole.NOT_SPECIFIED && !(p.role && roleDictionaryKey.includes(p.role))),
        )
        .map((person) => ({
          ...person,
          fullName: `${person.firstName} ${person.lastName}`,
          entryDate: dateToStringFr(person.entryDate),
        })),
    }))
    .filter(({ persons }) => persons.length),
)

const expandedIds = ref<string[]>(personsByRoles.value.map((_, idx) => `peson-expanded-${idx}`))
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
          <div class="w-full pl-0! pr-0! text-sm">
            <div class="grid-8-cols  grid">
              <div class="grid-8-cols__medium">
                <div class="flex-1 m-0! fr-text--xs fr-text--light">
                  Identité
                </div>
                <div class="flex-1 flex-grow fr-text--bold">
                  {{ person.fullName }}
                </div>
              </div>
              <div class="grid-8-cols__medium">
                <div class="flex-1 m-0! fr-text--xs fr-text--light">
                  Naissance
                </div>
                <div class="flex-1 fr-text--bold">
                  Née le {{ dateToStringFr(person.bornAt) }} {{ person.bornPlace ?? `à ${person.bornPlace}: ''` }}
                </div>
              </div>
              <div class="grid-8-cols__large flex-col">
                <div class="flex-1 m-0! fr-text--xs fr-text--light">
                  Adresse
                </div>
                <div class="flex-1">
                  <TooltipAddress :show="person.address && !person.address?.type" />
                  <span class="fr-text--bold">
                    {{ person.address?.label }}
                  </span>
                </div>
              </div>
              <div class="flex-1/8 flex-col">
                <div class="flex-1 m-0! fr-text--xs fr-text--light">
                  Nationalité
                </div>
                <div class="flex-1 fr-text--bold">
                  {{ person.nationality }}
                </div>
              </div>
              <div class="grid-8-cols__medium flex-grow-0">
                <div class="flex-1 m-0! fr-text--xs fr-text--light">
                  Pays de résidence
                </div>
                <div class="flex-1 fr-text--bold">
                  {{ person.residenceCountry }}
                </div>
              </div>
              <div class="grid-8-cols__medium flex-col">
                <div class="flex-1 m-0! fr-text--xs fr-text--light">
                  Fonction
                </div>
                <div class="flex-1 fr-text--bold">
                  <template v-if="person.jobPosition">
                    {{ person.jobPosition }}
                  </template>
                  <em v-else>Non renseigné</em>
                </div>
              </div>
              <div class="grid-8-cols__large">
                <div class="flex-1 m-0! fr-text--xs fr-text--light">
                  Date d’entrée dans l’administration
                </div>
                <div class="flex-1 fr-text--bold">
                  {{ person.entryDate }}
                </div>
              </div>
              <div v-if="person.exitDate" class="large flex-col">
                <div class="flex-1 m-0! fr-text--xs fr-text--light">
                  Date de sortie
                </div>
                <div class="flex-1 fr-text--bold">
                  {{ person.exitDate }}
                </div>
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
.grid-8-cols {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 1rem;
}

.grid-8-cols__medium {
  grid-column: span 2;
}

.grid-8-cols__large {
  grid-column: span 3;
}
</style>
