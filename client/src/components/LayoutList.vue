<template>
  <div
    class="fr-container"
  >
    <div class="fr-grid-row">
      <div class="bn-list-title fr-col-12">
        <slot name="title" />
      </div>
    </div>
    <div class="bn-list-table fr-col-12">
      <slot name="default" />
    </div>
  </div>
</template>
<style lang="css" scoped>
.fr-container {
  padding: 0;
}

.bn-list-title {
  height: 5.5rem;
}
</style>
