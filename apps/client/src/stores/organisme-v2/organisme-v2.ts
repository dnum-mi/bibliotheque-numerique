import type { IAssociationOutput, IFoundationOutput, IOrganismeOutput } from '@biblio-num/shared'
import { mockAssociationPayload } from './mock-association'
import { mockFoundationPayload } from './mock-foundation'
import apiClient from '@/api/api-client'
import type { OrganismeIdType } from '../organisme'

export const useOrganismeV2Store = defineStore('organisme', () => {
  const selectedOrganisme = ref<IAssociationOutput | IFoundationOutput | null>(null)
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
    return isFoundation.value ? (selectedOrganisme.value as IFoundationOutput) : null
  })

  const asAssociation = computed(() => {
    return isAssociation.value ? (selectedOrganisme.value as IAssociationOutput) : null
  })

  async function fetchOrganisme (id: string, type: OrganismeIdType) {
    isLoading.value = true
    error.value = null
    selectedOrganisme.value = null

    const organismeOutput: IOrganismeOutput = await apiClient[`getOrganismeBy${type}`](id)

    const data = (organismeOutput?.bn.rnfJson as IFoundationOutput) || (organismeOutput?.bn.rnaJson as IAssociationOutput) || undefined
    if (data) {
      selectedOrganisme.value = data
    } else {
      error.value = `L'organisme avec l'ID "${id}" n'a pas été trouvé.`
      console.error(error.value)
    }

    isLoading.value = false
  }

  async function fetchOrganismeEvents (id: string, type: OrganismeIdType) {
    if (!id || type !== 'Rnf') {
      return
    }

    return await apiClient.getOrganismeHistoryByRnf(id)
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
    fetchOrganismeEvents,
    clearOrganisme,
    mockAssociationId: mockAssociationPayload.id,
    mockFoundationId: mockFoundationPayload.id,
  }
})
