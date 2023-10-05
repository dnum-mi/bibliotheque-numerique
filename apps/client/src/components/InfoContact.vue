<script lang="ts" setup>
defineProps<{
  name: string;
  info: string;
  phone: string;
  email: string;
}>()
</script>

<template>
  <div class="fr-col-12 fr-mb-2w">
    <div class="fr-container">
      <div class="fr-grid-row">
        <div class="fr-col-3">
          <label class="bn-info-contact--text-sm fr-text--bold">{{ name }}</label>
          <span class="bn-info-contact--text-sm">{{ info }}</span>
        </div>
        <label class="bn-info-contact--text-sm fr-text--bold"> Téléphone </label>
        <span class="bn-info-contact--text-sm">
          {{ phone }}
        </span>

        <label class="bn-info-contact--text-sm fr-text--bold">Courriel</label>
        <span class="bn-info-contact--text-sm">
          {{ email }}
        </span>
      </div>
    </div>
  </div>
</template>

<style>
.bn-info-contact--text-sm {
  display: block;
  line-height: 1.5rem;
  font-size: 0.875rem;
}
</style>
