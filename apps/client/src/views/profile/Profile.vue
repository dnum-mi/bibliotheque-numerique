<template>
  <LayoutFiche
    title-bg-color="var(--border-plain-green-bourgeon)"
    title-fg-color="var(--background-default-grey)"
  >
    <template
      #title
    >
      <div class="flex items-center">
        <span
          class="fr-icon-profil-line"
          aria-hidden="true"
        />
        <h6 class="bn-banner-title m-0 fr-ml-1w">
          Mon Profile
        </h6>
      </div>
    </template>
  </LayoutFiche>
</template>

<script setup lang="ts">
import LayoutFiche from '@/components/Layout/LayoutFiche.vue'
</script>
