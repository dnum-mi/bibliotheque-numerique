<script setup lang="ts">
import { dateToStringFr } from '@/utils'
import type { IAssociationOutput } from '@biblio-num/shared'
import InfoRow from '@/views/organismes/components/InfoRow.vue'

defineProps<{
  association: IAssociationOutput,
}>()
</script>

<template>
  <section>
    <h2 class="fr-h4">
      Agrément
    </h2>
    <div class="fr-background-alt--grey fr-p-2w">
      <InfoRow label="Type d'agrément">
        {{ association.quality?.type || "-" }}
      </InfoRow>
      <InfoRow label="Date de début">
        {{ association.quality?.startedAt ? dateToStringFr(association.quality?.startedAt) : "-" }}
      </InfoRow>
      <InfoRow label="Date de fin">
        {{ association.quality?.endedAt ? dateToStringFr(association.quality?.endedAt) : "-" }}
      </InfoRow>
    </div>
  </section>
</template>
