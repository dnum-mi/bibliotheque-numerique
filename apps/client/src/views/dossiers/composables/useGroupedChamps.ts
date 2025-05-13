import type { IChamp } from '@biblio-num/shared'
import type { ChampDescriptor } from '@dnum-mi/ds-api-client'

export type ChampWithDescriptor = IChamp & {
  champDescriptor: ChampDescriptor
  champs?: ChampWithDescriptor[]
}

export interface Section {
  header?: ChampWithDescriptor
  contents: ChampWithDescriptor[]
}

export function useGroupedChamps (champsInput: () => ChampWithDescriptor[]) {
  const groupedChamps = computed<Section[]>(() => {
    const champs = champsInput()
    if (!Array.isArray(champs)) {
      return []
    }

    const sections: Section[] = []
    let currentSection: Section | null = null
    const noSectionContents: ChampWithDescriptor[] = []

    let hasSection = false

    for (const champ of champs) {
      if (champ?.champDescriptor?.type === 'header_section') {
        hasSection = true
        if (currentSection) {
          sections.push(currentSection)
        }
        currentSection = { header: champ, contents: [] }
      } else {
        if (currentSection) {
          currentSection.contents.push(champ)
        } else {
          noSectionContents.push(champ)
        }
      }
    }

    if (currentSection) {
      sections.push(currentSection)
    }

    if (!hasSection) {
      return noSectionContents.length > 0 ? [{ contents: noSectionContents }] : []
    }

    if (noSectionContents.length > 0) {
      sections.unshift({
        header: undefined,
        contents: noSectionContents,
      })
    }

    return sections
  })

  const menuItems = computed(() =>
    groupedChamps.value
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
    const el = document.getElementById(targetId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return {
    groupedChamps,
    menuItems,
    expandedSections,
    toggleSection,
    smoothScroll,
  }
}
