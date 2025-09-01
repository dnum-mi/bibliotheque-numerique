<script lang="ts" setup>
import BnPrez from '@/assets/bn.svg'
</script>

<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div
        class="fr-col-6    flex  justify-center  items-center"
      >
        <slot />
      </div>
      <div class="fr-col-6">
        <BnPrez class="w-full" />
      </div>
    </div>
  </div>
</template>
