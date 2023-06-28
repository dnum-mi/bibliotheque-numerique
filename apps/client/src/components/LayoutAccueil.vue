<script lang="ts" setup>
import BnPrez from '@/assets/bn.svg'
</script>

<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div
        class="fr-col-md-6"
      >
        <slot />
      </div>
      <div class="fr-col-md-6">
        <BnPrez />
      </div>
    </div>
  </div>
</template>
