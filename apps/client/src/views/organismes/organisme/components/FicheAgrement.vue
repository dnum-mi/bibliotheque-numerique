<script setup lang="ts">
import { dateToStringFr } from '@/utils'
import type { IAssociationOutput } from '@biblio-num/shared'

defineProps<{
  association: IAssociationOutput,
}>()
</script>

<template>
  <div>
    <div class="px-4 sm:px-0">
      <h3 class="text-base/7 font-semibold text-gray-900 mb-0 fr-background-alt--grey fr-py-3v fr-px-2w">
        Agrément
      </h3>
    </div>
    <div class="mt-6 border-t border-gray-100">
      <dl class="divide-y p-0">
        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Type
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            {{ association.quality?.type }}
          </dd>
        </div>
        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Date de début
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            {{ dateToStringFr(association.quality?.startedAt) }}
          </dd>
        </div>
        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Date de fin
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            {{ dateToStringFr(association.quality?.endedAt) }}
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
