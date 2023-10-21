<script lang="ts" setup>
defineProps<{
  name: string;
  info: string;
  phone: string;
  email: string;
}>()
</script>

<template>
  <div class="flex flex-row justify-between w-full">
    <div class="flex flex-col">
      <label class="bn-text--sm  fr-text--bold">
        {{ name }}
      </label>
      <span class="bn-text--sm">
        {{ info }}
      </span>
    </div>
    <div class="flex flex-col">
      <label class="bn-text--sm  fr-text--bold">Téléphone</label>
      <span class="bn-text--sm">
        {{ phone }}
      </span>
    </div>
    <div class="flex flex-col">
      <label class="bn-text--sm  fr-text--bold">Courriel</label>
      <span class="bn-text--sm">
        {{ email }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.bn-text--sm {
  display: block;
  line-height: 1.5rem;
  font-size: 0.875rem;
}
</style>
