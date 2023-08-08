<script lang="ts" setup>
import BnPrez from '@/assets/bn.svg'
</script>

<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div
        class="fr-col-md-6  flex  justify-center  items-center"
      >
        <slot />
      </div>
      <div class="fr-col-md-6">
        <BnPrez
          height="800"
          width="800"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.flex {
  display: flex;
}

.justify-center {
  justify-content: center;
}

.items-center {
  align-items: center;
}
</style>
