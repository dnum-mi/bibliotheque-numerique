<script lang="ts" setup>
import LayoutList from '@/components/Layout/LayoutList.vue'
</script>

<template>
  <LayoutList
    title="Administration des roles"
    title-bg-color="var(--green-tilleul-verveine-sun-418-moon-817)"
    title-icon="fr-icon-user-setting-line"
  >
    <router-view />
  </LayoutList>
</template>
