<script lang="ts" setup>
import { dateTimeToStringFr } from '@/utils/dateToString'
import { prettyByteSizeByString } from '@/utils/prettyByteSize'

defineProps<{
    email: string,
    body: string,
    createdAt: string,
    attachment: object,
    demandeur: string | boolean,
  }>()

</script>

<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col-1">
        <div v-if="demandeur">
          <span
            class="bn-ellipse-name"
          >{{ demandeur }}</span>
        </div>
        <div v-else>
          <img
            :src="'/marianne_icon.png'"
            class="bn-ellipse-img"
          >
        </div>
      </div>
      <div class="fr-col-11 bn-message--text">
        <span class="fr-callout__title fr-mr-2w">
          <a
            :href="'mailto:'+email"
            class="fr-link"
          >{{ email }}</a>
        </span>
        <span class="bn-message-date--text">{{ dateTimeToStringFr(createdAt) }}</span>
        <p class="bn-message-body--text fr-mt-2w">
          <span v-html="body" />
        </p>
        <p
          v-if="attachment"
          class="bn-dossier-pj-box"
        >
          <span
            class="fr-icon-file-line fr-icon--md fr-p-1w"
            aria-hidden="true"
          />
          <a
            :href="attachment.url"
            target="_blank"
            class="fr-link"
          >{{ attachment.filename }} <span class="fr-text--xs">({{ prettyByteSizeByString(attachment.byteSizeBigInt) }})</span></a>
        </p>
      </div>
    </div>
    <hr class="fr-mt-1w fr-mb-1v">
  </div>
</template>
