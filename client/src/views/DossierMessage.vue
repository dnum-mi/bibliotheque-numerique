<script lang="ts" setup>
import { dateTimeToStringFr } from '@/utils/dateToString'

defineProps<{
    email: string,
    body: string,
    createdAt: string,
  }>()

</script>

<template>
  <div
    class="fr-callout"
    style="width: 100%;"
  >
    <p class="fr-callout__title">
      {{ email }}
    </p>
    <p class="fr-callout__text">
      <span v-html="body" />
    </p>
    <p>{{ dateTimeToStringFr(createdAt) }}</p>
  </div>
</template>
