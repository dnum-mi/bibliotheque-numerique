<script lang="ts" setup>
import { computed } from 'vue'

const props = withDefaults(defineProps<{
    service?: object
  }>(), {
  service: () => ({}),
})
const labelKeys = {
  nom: 'Nom',
  organisme: 'Organisme',
  siret: 'Siret',
  typeOrganisme: 'Type Organisme',
}
type keyOfLabelKeys = keyof typeof labelKeys
type keyOfService = keyof typeof props.service
interface IField {
    id: string,
    label: string,
    value: string,
  }
const fields = computed<IField[]>(() => {
  return Object.keys(labelKeys).map<IField>((key) => ({
    id: `demarche-servie-${key}`,
    label: labelKeys[key as keyOfLabelKeys],
    value: props.service[key as keyOfService] || '',
  }),
  )
})

</script>

<template>
  <div class="fr-container">
    <h3> Service </h3>
    <div
      v-if="service"
      data-cy="cy-service"
      class="fr-container"
    >
      <div class="fr-grid-row">
        <div
          v-for="{ id, label, value} in fields"
          :key="id"
          class="fr-col-6 "
        >
          <label
            :for="id"
            class="fr-text--bold"
          > {{ label }} :</label> <span
            :id="id"
            class="fr-text"
          > {{ value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
