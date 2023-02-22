<template>
  <div class="fr-col-12 fr-mb-2w">
    <div class="fr-container">
      <div class="fr-grid-row">
        <div class="fr-col-3">
          <label class="bn-info-contact--text-sm fr-text--bold">{{ title }}</label>
          <span class="bn-info-contact--text-sm">{{ info }}</span>
        </div>
        <div class="fr-col-3">
          <label class="bn-info-contact--text-sm fr-text--bold"> Téléphone </label>
          <span
            v-for="(phone, index) in phones"
            :key="index"
            class="bn-info-contact--text-sm"
          >
            {{ phone }}</span>
        </div>
        <div class="fr-col-3">
          <label class="bn-info-contact--text-sm fr-text--bold">Courriel</label>
          <span class="bn-info-contact--text-sm">{{ eMail }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script
    lang="ts"
    setup
  >
defineProps<{
    title: string,
    info: string,
    phones: string[],
    eMail: string,
    }>()
</script>

<style>
  .bn-info-contact--text-sm {
  font-family: 'Marianne';
  font-style: normal;
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.5rem;
  display: block;
  }
</style>
