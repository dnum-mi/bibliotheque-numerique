<script setup lang="ts">
withDefaults(defineProps<{
  message?: string
}>(), { message: 'chargement en cours...' })
</script>

<template>
  <div
    class="w-full h-full opacity-30 bg-dark justify-center"
  >
    <div class="flex flex-col items-center">
      <VIcon
        class="mt-50"
        name="ri-refresh-line"
        color="white"
        scale="10"
        animation="spin"
      />
      <p class="text-white text-3xl">
        {{ message }}
      </p>
    </div>
  </div>
</template>
