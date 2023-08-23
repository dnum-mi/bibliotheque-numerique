<script lang="ts" setup>
import { computed } from 'vue'

import type { MappingColumn } from '@biblio-num/shared'

import DemarcheConfigurationMappingColumn from './DemarcheConfigurationMappingColumn.vue'

const props = withDefaults(defineProps<{
    mappingColumns: MappingColumn[]
  }>(), {
  mappingColumns: () => ([]),
})
const demarcheMappingColumns = computed<MappingColumn[]>(() => props.mappingColumns)
</script>

<template>
  <div class="fr-container">
    <ul class="list-none p-0 m-0">
      <template
        v-for="mappingColumn in demarcheMappingColumns"
        :key="mappingColumn.id"
      >
        <!-- Si le mappingColumn est un parent... -->
        <template v-if="mappingColumn.children">
          <!-- ...on affiche le parent... -->
          <li>
            <DemarcheConfigurationMappingColumn
              :id="mappingColumn.id"
              is-parent
              :type="mappingColumn.type"
              :label="mappingColumn.originalLabel"
              :initial-label-bn="mappingColumn.columnLabel"
            />
          </li>
          <!-- ...et tous ses enfants ensuite -->
          <li
            v-for="childMappingColumn of mappingColumn.children"
            :key="childMappingColumn.id"
          >
            <DemarcheConfigurationMappingColumn
              :id="childMappingColumn.id"
              :type="childMappingColumn.type"
              is-children
              :label="childMappingColumn.originalLabel"
            />
          </li>
        </template>
        <!-- Si le mappingColumn n’est pas un parent, on l’affiche simplement -->
        <template v-else>
          <li>
            <DemarcheConfigurationMappingColumn
              :id="mappingColumn.id"
              :type="mappingColumn.type"
              :label="mappingColumn.originalLabel"
              :initial-label-bn="mappingColumn.columnLabel"
            />
          </li>
        </template>
      </template>
    </ul>
  </div>
</template>

<style scoped>
.fr-label + .fr-input {
  margin-top: 0;
}

.truncate {
  display: inline-block;
  width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 1.25rem;
  vertical-align: top;
}
</style>
