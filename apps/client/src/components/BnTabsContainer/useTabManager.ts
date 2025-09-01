import type { Ref, WritableComputedRef } from 'vue'

export interface TabManagerProps {
  defaultTabId?: string | Ref<string | undefined>
  modelValue?: string | Ref<string | undefined>
  availableTabIds: Ref<Readonly<string[]>>
  queryParamName?: string
}

export function useTabManager ({ defaultTabId, modelValue, availableTabIds, queryParamName = 'tab' }: TabManagerProps) {
  const route = useRoute()
  const router = useRouter()

  const _activeTabId = ref<string | undefined>()

  const getInitialTabId = (): string | undefined => {
    const tabIdFromQuery = route.query[queryParamName] as string | undefined
    if (tabIdFromQuery && availableTabIds.value.includes(tabIdFromQuery)) {
      return tabIdFromQuery
    }

    const modelVal = typeof modelValue === 'string' ? modelValue : modelValue?.value
    if (modelVal && availableTabIds.value.includes(modelVal)) {
      return modelVal
    }

    const defaultVal = typeof defaultTabId === 'string' ? defaultTabId : defaultTabId?.value
    if (defaultVal && availableTabIds.value.includes(defaultVal)) {
      return defaultVal
    }

    return availableTabIds.value.length > 0 ? availableTabIds.value[0] : undefined
  }

  const activeTabId: WritableComputedRef<string | undefined> = computed({
    get: () => _activeTabId.value,
    set: (newId) => {
      if (_activeTabId.value === newId) {
        return
      }
      if (newId && !availableTabIds.value.includes(newId)) {
        return
      }
      _activeTabId.value = newId
    },
  })

  const updateQueryParam = (tabId: string | undefined) => {
    const currentQuery = { ...route.query }
    const currentQueryTab = currentQuery[queryParamName]

    if (tabId && currentQueryTab !== tabId) {
      currentQuery[queryParamName] = tabId
      router.replace({ query: currentQuery })
    } else if (!tabId && currentQueryTab) {
      delete currentQuery[queryParamName]
      router.replace({ query: currentQuery })
    }
  }

  watch(
    availableTabIds,
    (newAvailableIds) => {
      let currentTargetId = activeTabId.value
      if (!currentTargetId || !newAvailableIds.includes(currentTargetId)) {
        currentTargetId = getInitialTabId()
      }
      if (activeTabId.value !== currentTargetId || route.query[queryParamName] !== currentTargetId) {
        activeTabId.value = currentTargetId
      } else if (currentTargetId && route.query[queryParamName] !== currentTargetId) {
        updateQueryParam(currentTargetId)
      }
    },
    { immediate: true, deep: true },
  )

  watch(_activeTabId, (newId) => {
    updateQueryParam(newId)
  })

  watch(
    () => route.query[queryParamName],
    (newQueryTab) => {
      const currentQueryId = typeof newQueryTab === 'string' ? newQueryTab : undefined
      if (currentQueryId && availableTabIds.value.includes(currentQueryId) && activeTabId.value !== currentQueryId) {
        activeTabId.value = currentQueryId
      }
    },
    { immediate: true },
  )

  watch(
    () => (typeof modelValue === 'string' ? modelValue : modelValue?.value),
    (newModelVal) => {
      if (newModelVal && availableTabIds.value.includes(newModelVal) && activeTabId.value !== newModelVal) {
        activeTabId.value = newModelVal
      }
    },
  )

  return {
    activeTabId,
  }
}
