<template>
  <LayoutList>
    <template #title>
      <DsfrSearchBar
        class="bn-list-search"
        placeholder="Rechercher un organisme"
      />
    </template>
    <BiblioNumDataTableAgGrid
      class="bn-table-organisme"
      :headers="headerJson"
    />
  </LayoutList>
</template>
<script lang="ts" setup>

import BiblioNumDataTableAgGrid from '@/components/BiblioNumDataTableAgGrid.vue'
import LayoutList from '@/components/LayoutList.vue'
// const props = defineProps<{ }>()
const headerJson = [
  {
    text: 'Titre',
    value: 'titre',
  },
  {
    text: 'N°Org',
    value: 'rna_id',
  },
  {
    text: 'Type',
    value: 'type',
  },
  {
    text: 'Préfecture',
  },
  {
    text: 'Création',
  },
  {
    text: 'Modification',
  },
  {
    text: 'Représentant',
  },

]

</script>
<style lang="css">
.bn-list-search {
  flex-direction: row-reverse;
  background-color: var(--border-plain-grey);
  height: 100%;
}
.bn-list-search > .fr-input {
  background-color: var(--border-plain-grey);
  color: var(--background-default-grey)
}
.bn-list-search > .fr-input::placeholder {
  color: var(--background-default-grey)
}
.bn-list-search > .fr-input:focus {
  outline: none;
}

.bn-list-search > .fr-btn {
  background-color: var(--border-plain-grey);
  align-self: center;
}
</style>
