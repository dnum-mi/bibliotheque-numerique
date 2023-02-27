<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div
        class="bn-fiche-title fr-col-12"
      >
        <slot name="title" />
      </div>
      <div class="bn-fiche-sub-title fr-col-12">
        <slot name="sub-title" />
      </div>
      <div class="bn-fiche-body fr-col-12">
        <slot />
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
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
.bn-fiche-body {
  padding-top: 2rem;
}

</style>
