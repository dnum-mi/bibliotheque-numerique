import type { Ref } from 'vue'

export function usePageTitle (dynamicTitle: Ref<string> | (() => string)) {
  const route = useRoute()
  const MAIN_TITLE = 'Bibliothèque Numérique'
  const MAX_LENGTH = 50

  watch(
    () => {
      const title = typeof dynamicTitle === 'function' ? dynamicTitle() : dynamicTitle.value
      return [title, route.fullPath]
    },
    ([newTitle]) => {
      if (newTitle) {
        const truncatedTitle = newTitle.length > MAX_LENGTH
          ? `${newTitle.slice(0, MAX_LENGTH)}...`
          : newTitle

        document.title = `${truncatedTitle} - ${MAIN_TITLE}`
      } else {
        document.title = MAIN_TITLE
      }
    },
    { immediate: true },
  )
}
