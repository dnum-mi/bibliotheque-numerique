<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
}>(), {
  title: 'Pas de titre',
})
</script>

<template>
  <div class="flex flex-col w-full h-full fr-background-alt--grey overflow-hidden">
    <LayoutBanner
      :title="title"
      title-bg-color="var(--green-menthe-sun-373-moon-652)"
      title-icon=""
      class="flex-shrink-0"
    >
      <slot name="banner" />
    </LayoutBanner>

    <div class="relative flex flex-col w-full h-full fr-grid-row fr-grid-row--gutters fr-py-6v">
      <aside class="fr-col-3 fr-col-xl-2 fr-px-9v fr-py-5v">
        <slot name="sidebar" />
      </aside>

      <div class="flex h-full w-full fr-col-9 fr-col-xl-10 fr-mb-2w">
        <slot name="content" />
      </div>
    </div>
  </div>
</template>
