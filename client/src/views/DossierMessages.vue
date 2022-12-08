<script lang="ts" setup>
import { computed } from 'vue'
import DossierMessage from './DossierMessage.vue'

const props = withDefaults(defineProps<{
    datas?: object
  }>(), {
  datas: () => ({}),
})
const messages = computed(() => props.datas?.messages || [])
</script>

<template>
  <div
    v-if="datas"
    class="fr-container"
  >
    <div class="fr-grid-row">
      <div
        v-for="{ id, email, body, createdAt } in messages"
        :key="id"
        class="fr-col-12 fr-grid-row"
      >
        <DossierMessage
          data-cy="dossier-message"
          :email="email"
          :body="body"
          :created-at="createdAt"
        />
      </div>
    </div>
  </div>
</template>
