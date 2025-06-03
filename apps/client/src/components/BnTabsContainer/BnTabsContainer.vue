<script lang="ts" setup>
import { TabsContextKey } from './injection-key'
import type { TabInfo } from './injection-key'
import { useTabManager } from './useTabManager'

const props = defineProps<{
  defaultTabId?: string
  modelValue?: string
  queryParamName?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', id: string | undefined): void
  (e: 'tabChanged', newId: string | undefined, oldId: string | undefined): void
}>()

const registeredTabs = ref<Map<string, TabInfo>>(new Map())
let orderCounter = 0

const sortedTabs = computed(() => {
  return [...registeredTabs.value.values()].sort((a, b) => a.order - b.order)
})
const availableTabIds = computed(() => {
  return sortedTabs.value.map((tab) => tab.id)
})

const { activeTabId } = useTabManager({
  defaultTabId: toRefs(props).defaultTabId,
  modelValue: computed({
    get: () => props.modelValue,
    set: (id) => emit('update:modelValue', id),
  }),
  availableTabIds,
  queryParamName: props.queryParamName,
})

const previousActiveTabId = ref<string | undefined>()
const isTransitionAsc = ref(true)

watch(
  activeTabId,
  (newId, oldId) => {
    if (newId === oldId) {
      return
    }

    const oldIdx = oldId ? sortedTabs.value.findIndex((t) => t.id === oldId) : -1
    const newIdx = newId ? sortedTabs.value.findIndex((t) => t.id === newId) : -1
    isTransitionAsc.value = newIdx > oldIdx

    emit('update:modelValue', newId)
    emit('tabChanged', newId, oldId)
    previousActiveTabId.value = oldId
  },
  { immediate: true },
)

const registerTab = (tab: Omit<TabInfo, 'order'>) => {
  if (!registeredTabs.value.has(tab.id)) {
    registeredTabs.value.set(tab.id, {
      ...tab,
      title: typeof tab.title === 'object' && 'value' in tab.title ? tab.title.value : tab.title,
      order: orderCounter++,
    })
  }
}

const unregisterTab = (id: string) => {
  registeredTabs.value.delete(id)
  orderCounter = 0
  Array.from(registeredTabs.value.values())
    .sort((a, b) => a.order - b.order)
    .forEach((t) => (t.order = orderCounter++))
}

provide(TabsContextKey, { activeTabId, registerTab, unregisterTab, isTransitionAsc })

const selectTab = (id: string) => {
  const tab = registeredTabs.value.get(id)
  if (tab) {
    activeTabId.value = id
  }
}
</script>

<template>
  <div class="bn-scroll-parent bn-tabs-container fr-py-2v">
    <div
      class="bn-tabs-nav"
      role="tablist"
      aria-label="Onglets de navigation"
    >
      <button
        v-for="tab in sortedTabs"
        :id="`tab-button-${tab.id}`"
        :key="tab.id"
        role="tab"
        type="button"
        :class="{ active: tab.id === activeTabId }"
        :aria-selected="tab.id === activeTabId"
        :aria-controls="`tab-panel-${tab.id}`"
        :tabindex="tab.id === activeTabId ? 0 : -1"
        @click="selectTab(tab.id)"
      >
        {{ tab.title }}
      </button>
    </div>
    <div class="bn-tabs-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.bn-tabs-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  box-sizing: border-box;
  border-bottom: 1px solid var(--border-default-grey);
}

.bn-tabs-nav {
  position: relative;
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  padding-left: 1rem;
  padding-right: 1rem;
  flex-shrink: 0;
  gap: 0.5rem;
  margin: -1px 0;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.bn-tabs-nav:hover {
  scrollbar-color: var(--border-default-grey) transparent;
}

.bn-tabs-nav::-webkit-scrollbar {
  height: 8px;
}

.bn-tabs-nav::-webkit-scrollbar-track {
  background-color: transparent;
}

.bn-tabs-nav::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 4px;
  transition: background-color 0.2s ease-out;
}

.bn-tabs-nav::-webkit-scrollbar-thumb:hover {
  background-color: var(--border-default-grey);
}

.bn-tabs-nav button {
  padding: 0.5rem 1rem;
  border: none;
  border-bottom: 1px solid var(--border-default-grey);
  background: var(--background-action-low-blue-france);
  font-weight: bolder;
  cursor: pointer;
  border-radius: 0;
  margin-bottom: -1px;
  white-space: nowrap;
  flex-shrink: 0;
}

.bn-tabs-nav button:hover {
  background: var(--background-action-low-blue-france-hover) !important;
}

.bn-tabs-nav button.active {
  background: white;
  color: var(--border-active-blue-france);
  border-inline: 1px solid var(--border-default-grey);
  border-bottom: 1px solid white !important;
  border-top: 2px solid var(--border-active-blue-france);
}

.bn-tabs-content {
  flex-grow: 1;
  overflow-x: hidden;
  overflow-y: auto;
  padding-inline: 0.5rem;
  border-top: 1px solid var(--border-default-grey);
}
</style>
