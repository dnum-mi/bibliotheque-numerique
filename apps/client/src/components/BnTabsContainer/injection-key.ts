import type { Ref, WritableComputedRef, InjectionKey, VNode } from 'vue'

export type TabInfo = {
  id: string
  title: string
  icon?: VNode[]
  order: number // maintenir l'ordre d'enregistrement
}

export type RegisterTabPayload = Omit<TabInfo, 'order'> & {
  title: string | Ref<string>
  icon?: VNode[] | Ref<VNode[] | undefined>
}

export type TabContext = {
  activeTabId: WritableComputedRef<string | undefined>
  registerTab: (tab: RegisterTabPayload) => void
  unregisterTab: (tabId: string) => void
  updateTabTitle: (id: string, title: string) => void
  updateTabIcon: (id: string, icon: VNode[] | undefined) => void
  isTransitionAsc: Readonly<Ref<boolean>>
}

export const TabsContextKey: InjectionKey<TabContext> = Symbol('TabsContext')
