<script setup lang="ts">
import { EOrganismeIdType, type OrganismeIdType } from '@/stores'
import { defineProps } from 'vue'

defineProps<{
  entityType: OrganismeIdType
}>()
</script>

<template>
  <div
    class="flex flex-col justify-center items-center text-center py-24 px-6 bg-gray-100 rounded-lg m-4"
  >
    <span
      class="fr-icon-info-fill"
      aria-hidden="true"
    />

    <h3 class="text-xl font-semibold text-gray-800">Aucun historique disponible</h3>

    <p class="text-gray-600 mt-2 text-sm max-w-2/3">
      Cette {{ entityType === EOrganismeIdType.Rna ? 'association' : 'fondation' }} n'a pas encore de versions antérieures enregistrées. Son
      historique commencera à se construire à partir de la prochaine modification.
    </p>
  </div>
</template>
