import type { Ref, WritableComputedRef, InjectionKey } from 'vue'

export type TabInfo = {
  id: string
  title: Ref<string>
  order: number // maintenir l'ordre d'enregistrement
}

export type TabContext = {
  activeTabId: WritableComputedRef<string | undefined>
  registerTab: (tab: Omit<TabInfo, 'order'>) => void
  unregisterTab: (tabId: string) => void
  updateTabTitle: (id: string, title: string) => void
  isTransitionAsc: Readonly<Ref<boolean>>
}

export const TabsContextKey: InjectionKey<TabContext> = Symbol('TabsContext')
