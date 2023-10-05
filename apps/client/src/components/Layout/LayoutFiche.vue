<template>
  <div>
    <div class="fr-grid-row m-4">
      <div class="bn-fiche-title bn-fiche-space-left fr-col-12">
        <slot name="title" />
      </div>
      <div class="bn-fiche-sub-title bn-fiche-space-left fr-col-12">
        <slot name="sub-title" />
      </div>
      <div>
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.bn-fiche-title {
  height: 5.25rem;
  align-items: baseline;
  display: flex;
  background-color: var(--background-alt-grey);
  margin: 0.125rem;
  flex-wrap: wrap;
  align-content: flex-end;
}
.bn-fiche-sub-title {
  height: 4rem;
  align-items: center;
  display: flex;
  background-color: var(--background-alt-grey);
  margin: 0.125rem;
}
</style>
