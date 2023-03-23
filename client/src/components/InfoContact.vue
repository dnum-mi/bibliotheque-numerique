<template>
  <div class="fr-col-12 fr-mb-2w">
    <div class="fr-container">
      <div class="fr-grid-row">
        <div class="fr-col-3">
          <label class="bn-info-contact--text-sm fr-text--bold">{{ title }}</label>
          <span class="bn-info-contact--text-sm">{{ name }}</span>
        </div>
        <div
          v-if="phones.length"
          class="fr-col-3"
        >
          <label class="bn-info-contact--text-sm fr-text--bold"> Téléphone </label>
          <span
            v-for="(phone, index) in phones"
            :key="index"
            class="bn-info-contact--text-sm"
          >
            {{ phone }}</span>
        </div>
        <div
          v-if="emails.length"
          class="fr-col-3"
        >
          <label class="bn-info-contact--text-sm fr-text--bold">Courriel</label>
          <span
            v-for="(email, index) in emails"
            :key="index"
            class="bn-info-contact--text-sm"
          >{{ email }}</span>
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
    name: string,
    phones: string[],
    emails: string[],
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
