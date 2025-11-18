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
  }>(),
  {},
)

const asAssociation = computed(() => {
  return !props.isFoundation ? (props.organisme as IAssociationOutput) : null
})
</script>

<template>
  <div class="py-6 px-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
    <div class="flex flex-col gap-8">
      <FicheIdentity
        :organisme="organisme"
        :is-foundation="isFoundation"
      />

      <FicheActivity
        :organisme="organisme"
        :is-foundation="isFoundation"
      />
      <FicheCompte
        :organisme="organisme"
        :missing-declaration-years="missingDeclarationYears"
      />
    </div>

    <div class="flex flex-col gap-8">
      <FicheContact
        :organisme="organisme"
      />
      <FicheAgrement
        v-if="!isFoundation && asAssociation"
        :association="asAssociation"
      />
    </div>
  </div>
</template>

<style scoped>
.divide-y > :not(:last-child) {
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-color: rgb(243 244 246);
}
</style>
