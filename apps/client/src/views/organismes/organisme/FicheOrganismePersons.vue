<script lang="ts" setup>
import type { IPerson } from '@biblio-num/shared'
import { qualityInOrganismeArray } from '@biblio-num/shared'
import { DsfrAccordion, registerAccordionKey } from '@gouvminint/vue-dsfr'
import { dateToStringFr } from '../../../utils'
import TooltipAddress from './TooltipAddress.vue'

const props = defineProps<{ persons: IPerson[] }>()

const Foundateurs = 'Foundateurs'
const Autres = 'Autres'
const roleKeys = [Foundateurs, ...qualityInOrganismeArray, Autres]
type TPersonOrganisme = IPerson & { fullName: string }
type TPersonByRole = {
  role: string
  persons: TPersonOrganisme[]
}

const personsByRoles = computed<TPersonByRole[]>(() => {
  const recordPersons = props.persons.reduce <Record<typeof roleKeys[number], TPersonOrganisme[]>>((acc, cur) => {
    const p = {
      ...cur,
      fullName: `${cur.firstName} ${cur.lastName}`,
    }
    if (cur.isFounder) {
      if (!acc[Foundateurs]) { acc[Foundateurs] = [] }
      acc[Foundateurs]?.push(p)
    }
    const role = roleKeys.includes(cur.quality || Autres) ? cur.quality || Autres : Autres
    if (!acc[role]) { acc[role] = [] }
    acc[role]?.push(p)

    return acc
  }, {})
  return Object.entries(recordPersons).map(([r, p]) => ({
    role: r,
    persons: p,
  }))
})

const accordions = ref(new Map<number, {
  title: string,
  expended: boolean,
}>())

const countId = ref(0)

provide(registerAccordionKey, (title: Ref<string>) => {
  const myIndex = countId.value++
  accordions.value.set(myIndex, {
    title: title.value,
    expended: true,
  })

  watch(title, () => {
    accordions.value.set(myIndex, { title: title.value, expended: true })
  })

  onUnmounted(() => {
    accordions.value.delete(myIndex)
  })

  const isActive = computed(() => {
    const accordion = accordions.value.get(myIndex)
    return !!accordion?.expended
  })
  function expand (): void {
    const accordion = accordions.value.get(myIndex)
    if (accordion) {
      accordion.expended = !accordion.expended
    }
  }
  return { isActive, expand }
})
</script>

<template>
  <ul class="fr-accordions-group">
    <li
      v-for="(personsByRole, idx) in personsByRoles"
      :key="`peson-by-role-${idx}`"
    >
      <DsfrAccordion
        :id="`peson-expanded-${idx}`"
        :title="personsByRole.role"
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
          class="p-t-6 person-row"
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
              <div class="grid-8-cols__large flex-col">
                <div class="flex-1 m-0! fr-text--xs fr-text--light">
                  Adresse
                </div>
                <div class="flex-1">
                  <TooltipAddress :show="!!(person.address && !person.address?.coordinates)" />
                  <span class="fr-text--bold">
                    {{ person.address?.oneLine }} {{ person.residenceCountry?.toUpperCase() }}
                  </span>
                </div>
              </div>
              <div class="grid-8-cols__medium">
                <div class="flex-1 m-0! fr-text--xs fr-text--light">
                  Naissance
                </div>
                <div class="flex-1 fr-text--bold">
                  Née le {{ dateToStringFr(person.bornAt) }} {{ person.bornPlace && `à ${person.bornPlace}` || '' }}
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
              <div class="grid-8-cols__large flex-col">
                <div class="flex-1 m-0! fr-text--xs fr-text--light">
                  Metier
                </div>
                <div class="flex-1 fr-text--bold">
                  <template v-if="person.profession">
                    {{ person.profession }}
                  </template>
                  <em v-else>Non renseigné</em>
                </div>
              </div>
              <div class="grid-8-cols__medium flex-col">
                <div class="flex-1 m-0! fr-text--xs fr-text--light">
                  Date d’entrée dans l’administration
                </div>
                <div class="flex-1 fr-text--bold">
                  {{ dateToStringFr(person.entryAt) }}
                </div>
              </div>
              <div class="flex-1/8 flex-col">
                <div class="flex-1 m-0! fr-text--xs fr-text--light">
                  Date de sortie
                </div>
                <div class="flex-1 fr-text--bold">
                  {{ dateToStringFr(person.exitAt) }}
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

.person-row:nth-child(even) {
 background-color: var(--grey-950-100);
}
</style>
