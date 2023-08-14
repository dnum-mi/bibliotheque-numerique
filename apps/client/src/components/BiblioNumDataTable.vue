<template>
  <DsfrTable
    :title="title"
  >
    <template #header>
      <tr>
        <DsfrTableHeader
          v-for="(header,idx) of headers"
          :key="header.value"
          :header="header.text || ''"
          :icon="icons[idx]"
          @click="onClick(idx, header.sortable)"
        />
      </tr>
    </template>
    <tr
      v-for="data in datas"
      :key="data"
    >
      <td>
        <DsfrButton
          :label="label"
          :disabled="disabled"
          :icon="icon"
          :icon-right="iconRight"
          @click="getElt(data)"
        />
      </td>

      <td
        v-for="header in headersDisplay"
        :key="header.value"
      >
        {{
          header.value
            ? ( header.parseFn
              ? header.parseFn(data[header.value])
              : data[header.value])
            : ''
        }}
      </td>
    </tr>
  </DsfrTable>
</template>

<script lang="ts" setup>
import { computed, reactive } from 'vue'
import type { HeaderDataTable } from '@/shared/types'

const icon = 'ri-search-line'
const props = withDefaults(defineProps<{
    title: string,
    datas?: object,
    headers?: HeaderDataTable[],
    withAction?: boolean,
  }>(), {
  datas: () => ({}),
  headers: () => [],
  withAction: false,
})

const headersDisplay = computed(() => props.headers.filter(header => header.text !== undefined))
const icons = reactive(props.headers.map(header => header.sortable ? { name: 'ri-sort-asc' } : undefined))

const onClick = (idx:number, sortable?:boolean) => {
  if (!sortable) return
  const iconName = icons[idx]?.name
  icons[idx] = iconName === 'ri-sort-desc'
    ? { name: 'ri-sort-asc' }
    : iconName === 'ri-sort-asc'
      ? undefined
      : { name: 'ri-sort-desc' }
}

const emit = defineEmits(['getElt'])
const getElt = data => {
  emit('getElt', data)
}
</script>
@/shared/types/DataTable.type
