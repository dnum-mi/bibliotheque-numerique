<script lang="ts" setup>
import { dateTimeToStringFr } from '@/utils/dateToString'

defineProps<{
    email: string,
    body: string,
    createdAt: string,
    attachment: object,
  }>()

</script>

<template>
  <div class="fr-container">
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
      <p
        v-if="attachment"
        class="fr-callout__text"
      >
        <a
          :href="attachment.url"
          target="_blank"
        >{{ attachment.filename }}</a>
      </p>
      <p>{{ dateTimeToStringFr(createdAt) }}</p>
    </div>
  </div>
</template>
