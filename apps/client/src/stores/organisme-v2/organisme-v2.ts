import type { siafV2 } from '@biblio-num/shared'
import { mockAssociationPayload } from './mock-association'
import { mockFoundationPayload } from './mock-foundation'

const mockDatabase = new Map<string, siafV2.IAssociationOutput | siafV2.IFoundationOutput>([
  [mockAssociationPayload.publicId, mockAssociationPayload],
  [mockFoundationPayload.publicId, mockFoundationPayload],
])

export const useOrganismeV2Store = defineStore('organisme', () => {
  const selectedOrganisme = ref<siafV2.IAssociationOutput | siafV2.IFoundationOutput | null>(null)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const isFoundation = computed(() => {
    if (!selectedOrganisme.value) {
      return false
    }
    return 'foundationType' in selectedOrganisme.value
  })

  const isAssociation = computed(() => {
    if (!selectedOrganisme.value) {
      return false
    }
    return 'activityDomainCode' in selectedOrganisme.value
  })

  const organismeTitle = computed(() => selectedOrganisme.value?.title || 'Organisme')

  const asFoundation = computed(() => {
    return isFoundation.value ? (selectedOrganisme.value as siafV2.IFoundationOutput) : null
  })

  const asAssociation = computed(() => {
    return isAssociation.value ? (selectedOrganisme.value as siafV2.IAssociationOutput) : null
  })

  async function fetchOrganisme (id: string) {
    isLoading.value = true
    error.value = null
    selectedOrganisme.value = null

    console.log(`[Store] Fetching organisme with id: ${id}`)

    // Simule une latence réseau
    await new Promise((resolve) => setTimeout(resolve, 600))

    const data = mockDatabase.get(id)

    if (data) {
      selectedOrganisme.value = data
    } else {
      error.value = `L'organisme avec l'ID "${id}" n'a pas été trouvé.`
      console.error(error.value)
    }

    isLoading.value = false
  }

  function clearOrganisme () {
    selectedOrganisme.value = null
    error.value = null
    isLoading.value = false
  }

  return {
    selectedOrganisme,
    isLoading,
    error,
    isFoundation,
    isAssociation,
    organismeTitle,
    asFoundation,
    asAssociation,
    fetchOrganisme,
    clearOrganisme,
    mockAssociationId: mockAssociationPayload.publicId,
    mockFoundationId: mockFoundationPayload.publicId,
  }
})
