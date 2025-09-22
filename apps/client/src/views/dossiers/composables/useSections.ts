import type { IFieldList, IFieldRepetable, IFieldSimple } from '@biblio-num/shared'

export interface Section {
  header: IFieldSimple
  contents: (IFieldSimple | IFieldRepetable)[]
}

export interface MenuItem {
  id: string
  text: string
  to: string
}

export function useSections (groupsInput: () => IFieldList[]) {
  const sections = computed<Section[]>(() => {
    const backendGroups = groupsInput()
    if (!Array.isArray(backendGroups)) {
      return []
    }

    return backendGroups.map((group) => ({
      header: {
        id: group.id,
        label: group.title,
        type: 'header_section',
        value: null,
        description: null,
        format: null,
      },
      contents: group.items,
    }))
  })

  const menuItems = computed<MenuItem[]>(() =>
    sections.value
      .filter((s) => s.header)
      .map((s) => ({
        id: s.header!.id,
        text: s.header!.label || '',
        to: `#${s.header!.id}`,
      })),
  )

  const expandedSections = ref<string[]>([])

  watch(
    menuItems,
    (newSections) => {
      expandedSections.value = newSections.map((s) => s.id)
    },
    { immediate: true },
  )

  const toggleSection = (id: string) => {
    expandedSections.value = expandedSections.value.includes(id)
      ? expandedSections.value.filter((sid) => sid !== id)
      : [...expandedSections.value, id]
  }

  const smoothScroll = (targetId: string) => {
    // On s'assure que le code ne s'exécute que côté client
    if (typeof window !== 'undefined') {
      const el = document.getElementById(targetId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return {
    // On renomme `groupedChamps` en `sections` pour plus de clarté
    sections,
    menuItems,
    expandedSections,
    toggleSection,
    smoothScroll,
  }
}
