<script lang="ts" setup>
import { useDemarcheStore } from '@/stores'

const demarcheStore = useDemarcheStore()
const groupInstructeurs = computed(() => demarcheStore.currentDemarche?.dsDataJson?.groupeInstructeurs || [])
const activeAccordion = ref<number>()
</script>

<template>
  <div class="fr-container  fr-mb-2w">
    <h3>
      Groupes Instructeurs
    </h3>

    <DsfrAccordionsGroup
      v-if="groupInstructeurs && groupInstructeurs.length"
      v-model="activeAccordion"
      data-cy="cy-grpInstucteur"
    >
      <DsfrAccordion
        v-for="{ number, label, instructeurs } in groupInstructeurs"
        :key="number"
        :title="label"
      >
        <div
          v-for=" instructeur in instructeurs"
          :key="instructeur?.id"
          class="fr-p-3v"
        >
          {{ instructeur?.email }}
        </div>
      </DsfrAccordion>
    </DsfrAccordionsGroup>
  </div>
</template>
