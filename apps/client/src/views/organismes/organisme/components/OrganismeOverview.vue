<script setup lang="ts">
import type { IAssociationOutput, IFoundationOutput } from '@biblio-num/shared'
import FicheIdentity from './FicheIdentity.vue'
import FicheContact from './FicheContact.vue'
import FicheAgrement from './FicheAgrement.vue'
import FicheActivity from './FicheActivity.vue'
import FicheCompte from './FicheCompte.vue'

const props = withDefaults(
  defineProps<{
    organisme: IAssociationOutput | IFoundationOutput
    missingDeclarationYears?: number[]
    isFoundation: boolean
    serviceInstructor?: string
  }>(),
  {},
)

const asAssociation = computed(() => {
  return !props.isFoundation ? (props.organisme as IAssociationOutput) : null
})
</script>

<template>
  <div class="py-6 px-4 grid grid-cols-1 gap-6 xl:grid-cols-2">
    <FicheIdentity
      :organisme="organisme"
      :is-foundation="isFoundation"
      :service-instructor="serviceInstructor"
    />
    <FicheContact
      :organisme="organisme"
    />

    <FicheActivity
      :organisme="organisme"
      :is-foundation="isFoundation"
    />
    <FicheCompte
      :organisme="organisme"
      :missing-declaration-years="missingDeclarationYears"
    />
    <FicheAgrement
      v-if="!isFoundation && asAssociation"
      :association="asAssociation"
    />
  </div>
</template>

<style>
.divide-y > :not(:last-child) {
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-color: rgb(243 244 246);
}
</style>
