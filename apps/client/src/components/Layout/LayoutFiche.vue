<template>
  <div>
    <div class="flex flex-col justify-between w-full h-full">
      <div class="flex flex-col gap-3 w-full grow">
        <div class="bn-fiche-title fr-p-3w">
          <slot name="title" />
        </div>
        <div class="bn-fiche-sub-title fr-p-2w">
          <slot name="sub-title" />
        </div>
        <div class="grow">
          <slot name="content" />
        </div>
      </div>
      <div class="w-full">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
</script>
<style scoped>
.bn-fiche-title {
  background-color: var(--background-alt-grey);
}

.bn-fiche-sub-title {
  background-color: var(--background-alt-grey);
}
</style>
