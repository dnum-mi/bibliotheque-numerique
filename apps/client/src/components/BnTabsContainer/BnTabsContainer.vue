<script lang="ts" setup>
import { TabsContextKey } from './injection-key'
import type { RegisterTabPayload, TabInfo } from './injection-key'
import { useTabManager } from './useTabManager'
import { getRandomString } from '@gouvminint/vue-dsfr'

const props = defineProps<{
  defaultTabId?: string
  modelValue?: string
  queryParamName?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', id: string | undefined): void
  (e: 'tabChanged', newId: string | undefined, oldId: string | undefined): void
}>()

const getRandomTabKey = () => {
  return `tab-key-${getRandomString(5)}`
}
const registeredTabs = ref<Map<string, TabInfo>>(new Map())
const tabsKey = ref(getRandomTabKey())
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

const registerTab = (tab: RegisterTabPayload) => {
  if (!registeredTabs.value.has(tab.id)) {
    registeredTabs.value.set(tab.id, {
      id: tab.id,
      title: unref(tab.title),
      icon: tab.icon,
      order: orderCounter++,
    })
  }
}

const updateTabTitle = (id: string, title: string) => {
  const tab = registeredTabs.value.get(id)
  if (tab) {
    registeredTabs.value.set(tab.id, {
      ...tab,
      title,
      order: tab.order,
    })
    tabsKey.value = getRandomTabKey() // Force re-render of the tab list
  }
}

const updateTabIcon = (id: string, icon: VNode[] | undefined) => {
  const tab = registeredTabs.value.get(id)
  if (tab) {
    registeredTabs.value.set(id, { ...tab, icon })
  }
}

const unregisterTab = (id: string) => {
  registeredTabs.value.delete(id)
  orderCounter = 0
  Array.from(registeredTabs.value.values())
    .sort((a, b) => a.order - b.order)
    .forEach((t) => (t.order = orderCounter++))
}

provide(TabsContextKey, { activeTabId, registerTab, unregisterTab, updateTabTitle, updateTabIcon, isTransitionAsc })

const selectTab = (id: string) => {
  const tab = registeredTabs.value.get(id)
  if (tab) {
    activeTabId.value = id
  }
}

const handleKeydown = (event: KeyboardEvent, currentId: string) => {
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
    return
  }

  event.preventDefault()

  const currentIndex = sortedTabs.value.findIndex(t => t.id === currentId)
  let nextIndex = 0

  if (event.key === 'ArrowRight') {
    nextIndex = currentIndex === sortedTabs.value.length - 1 ? 0 : currentIndex + 1
  } else if (event.key === 'ArrowLeft') {
    nextIndex = currentIndex === 0 ? sortedTabs.value.length - 1 : currentIndex - 1
  }

  const nextTabId = sortedTabs.value[nextIndex]?.id

  nextTick(() => {
    const nextButton = document.getElementById(`tab-button-${nextTabId}`)
    if (nextButton) {
      nextButton.focus()
    }
  })
}
</script>

<template>
  <div class="bn-scroll-parent bn-tabs-container">
    <div
      :key="tabsKey"
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
        class="bn-tab-btn"
        :class="{ active: tab.id === activeTabId }"
        :aria-selected="tab.id === activeTabId"
        :aria-controls="`tab-panel-${tab.id}`"
        :tabindex="tab.id === activeTabId ? 0 : -1"
        @click="selectTab(tab.id)"
        @keydown="handleKeydown($event, tab.id)"
      >
        <span v-if="tab.icon" class="bn-tab-icon">
          <component
            :is="vnode"
            v-for="(vnode, index) in tab.icon"
            :key="index"
            class="fr-icon--sm"
          />
        </span>
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
  border-top: 3px solid var(--border-active-blue-france);
}

.bn-tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.bn-tab-btn.active {
  color: var(--text-active-blue-france);
  border-bottom-color: var(--border-active-blue-france);
}
.bn-tab-icon {
  display: inline-flex;
  fill: currentColor;
}
.bn-tab-icon :deep(svg) {
  width: 1rem;
  height: 1rem;
}

.bn-tabs-content {
  flex-grow: 1;
  overflow-x: hidden;
  overflow-y: auto;
  padding-inline: 0.5rem;
  border-top: 1px solid var(--border-default-grey);
  background: white;
}
</style>
