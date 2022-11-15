<script lang="ts" setup>
withDefaults(defineProps<{
    datas?: any[]
  }>(), {
  datas: () => ([]),
})

const dataCy = 'dossier-champs'
</script>>
<template>
  <div
    v-if="datas"
    :data-cy="dataCy"
    class="fr-container"
  >
    <div class="fr-grid-row">
      <div
        v-for="{ id, label, stringValue } in datas"
        :key="id"
        class="fr-col-12 fr-grid-row"
      >
        <label
          :for="id"
          class="fr-text--bold fr-col-6"
        > {{ label }} :</label>
        <span
          :id="id"
          class="fr-text fr-col-6"
        > {{ stringValue }}</span>
      </div>
    </div>
  </div>
</template>
