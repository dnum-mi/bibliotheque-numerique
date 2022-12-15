<script setup lang="ts">

import { useUserStore } from '@/stores'

const userStore = useUserStore()
const datas = userStore.currentUser
const dataCy = 'profile'
</script>

<template>
  <h2 class="mb-20">
    Mon profil
  </h2>
  <div
    v-if="datas"
    :data-cy="dataCy"
    class="fr-container"
  >
    <div class="fr-grid-row">
      <div
        v-for="(item, key, index) in datas"
        :key="index"
        class="fr-col-12 fr-grid-row"
      >
        <label
          :for="index"
          class="fr-text--bold fr-col-6"
        > {{ key }} :</label>
        <span
          :id="index"
          class="fr-text fr-col-6"
        > {{ item }}</span>
      </div>
    </div>
  </div>
</template>
