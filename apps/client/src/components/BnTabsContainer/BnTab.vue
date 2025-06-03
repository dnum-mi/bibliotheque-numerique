<script lang="ts" setup>
import { TabsContextKey } from './injection-key'

const props = defineProps<{
  id: string
  title: string
}>()

const { id: tabId, title: tabTitle } = toRefs(props)

const context = inject(TabsContextKey)
if (!context) {
  throw new Error('BnTabContent doit être utilisé à l\'intérieur d\'un BnTabs')
}
const { activeTabId, registerTab, unregisterTab, isTransitionAsc } = context

const isActive = computed(() => activeTabId.value === tabId.value)

onMounted(() => {
  registerTab({ id: tabId.value, title: tabTitle })
})

onUnmounted(() => {
  unregisterTab(tabId.value)
})

watch(tabTitle, () => {
  unregisterTab(tabId.value)
  registerTab({ id: tabId.value, title: tabTitle })
})

const translateValueFrom = computed(() => (isTransitionAsc.value ? '100%' : '-100%'))
const translateValueTo = computed(() => (isTransitionAsc.value ? '-100%' : '100%'))
</script>

<template>
  <Transition
    name="slide-fade"
    mode="out-in"
  >
    <div
      v-if="isActive"
      :id="`tab-panel-${tabId}`"
      :key="tabId"
      role="tabpanel"
      class="bn-tab-panel"
      :aria-labelledby="`tab-button-${tabId}`"
      tabindex="0"
    >
      <slot />
    </div>
  </Transition>
</template>

<style scoped>
.bn-tab-panel {
  height: 100%;
  overflow: auto;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s linear;
}

.slide-fade-enter-from {
  transform: translateX(v-bind(translateValueFrom));
  opacity: 0;
}
.slide-fade-leave-to {
  transform: translateX(v-bind(translateValueTo));
  opacity: 0;
}
</style>
