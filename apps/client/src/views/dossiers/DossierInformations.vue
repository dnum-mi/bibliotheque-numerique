<script lang="ts" setup>
import type { IDossierFieldsOutput } from '@biblio-num/shared'

import { dateTimeToStringFr } from '@/utils'

const props = withDefaults(
  defineProps<{
    datas?: IDossierFieldsOutput | Record<string, never>
  }>(),
  {
    datas: () => ({}),
  },
)

const prefecture = computed(() => props.datas.prefecture?.toUpperCase() || '')
const depot = computed(() => dateTimeToStringFr(props.datas.dateDepot?.toString() as string) || '')
const instruction = computed(() => dateTimeToStringFr(props.datas.datePassageEnInstruction?.toString() as string) || '')
const publication = computed(() => '')
const etat = computed(() => props.datas?.state)
</script>

<template>
  <div class="fr-pl-2v">
    <div class="fr-grid-row">
      <div class="fr-col-2">
        <label class="bn-fiche-sub-title--label">SERVICE INSTRUCTEUR</label>
        <span class="bn-fiche-sub-title--text">{{ prefecture }}</span>
      </div>
      <div class="fr-col-2">
        <label class="bn-fiche-sub-title--label">DÉPÔT</label>
        <span class="bn-fiche-sub-title--text">{{ depot }}</span>
      </div>
      <div class="fr-col-2">
        <label class="bn-fiche-sub-title--label">INSTRUCTION</label>
        <span class="bn-fiche-sub-title--text">{{ instruction }}</span>
      </div>
      <div class="fr-col-2">
        <label class="bn-fiche-sub-title--label">PUBLICATION</label>
        <span class="bn-fiche-sub-title--text">{{ publication }}</span>
      </div>
      <div class="fr-col-2">
        <label class="bn-fiche-sub-title--label">ÉTAT</label>
        <StatusBadge :status="etat!" />
      </div>
    </div>
  </div>
</template>
