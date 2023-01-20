<script lang="ts" setup>
import { ref } from 'vue'

defineProps<{
    groupInstructeurs?: []
  }>()
const expandedId = ref(undefined)

</script>

<template>
  <div class="fr-container">
    <h3>
      Groupe Instructeurs
    </h3>

    <DsfrAccordionsGroup
      v-if="groupInstructeurs && groupInstructeurs.length"
      data-cy="cy-grpInstucteur"
    >
      <li>
        <DsfrAccordion
          v-for="{ number, label, instructeurs } in groupInstructeurs"
          :key="number"
          :title="label"
          :expanded-id="expandedId"
          @expand="expandedId = $event"
        >
          <div
            v-for=" instructeur in instructeurs"
            :key="instructeur?.id"
            class="fr-p-3v"
          >
            {{ instructeur?.email }}
          </div>
        </DsfrAccordion>
      </li>
    </DsfrAccordionsGroup>
  </div>
</template>
