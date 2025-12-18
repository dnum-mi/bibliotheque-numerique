import { defineStore } from 'pinia'
import {
  EOrganismeCategory,
  fromAssociationToBasicOrganisme,
  fromFoundationToBasicOrganisme,
} from '@biblio-num/shared'
import type {
  IAssociationOutput,
  IBasicOrganisme,
  IFoundationOutput,
  organismeCategoryKey,
} from '@biblio-num/shared'
import apiClient from '@/api/api-client.ts'

type TOrganisme = IFoundationOutput | IAssociationOutput

export const useOrganismeHubStore = defineStore('organismeHub', () => {
  const currentOrganisme = ref<TOrganisme | null>(null)
  const currentType = ref<organismeCategoryKey | null>(null)
  const currrentBasicOrganisme = computed<IBasicOrganisme | null>(() => {
    if (!currentOrganisme.value) {
      return null
    }
    return currentType.value === EOrganismeCategory.association
      ? fromAssociationToBasicOrganisme(currentOrganisme.value as IAssociationOutput)
      : fromFoundationToBasicOrganisme(currentOrganisme.value as IFoundationOutput)
  })

  const getTypeOrganismeFromRef = (organismeRef: string): organismeCategoryKey | null => {
    if (!organismeRef) {
      return null
    }
    if (organismeRef[0] === 'W') {
      return EOrganismeCategory.association
    } else if (/\d{3}-\w{3,4}-\d{5}-\d{2}/.test(organismeRef)) {
      return EOrganismeCategory.fondation
    }
    return null
  }

  const setCurrentAssociationByRef = async (organismeRef: string) => {
    const organisme = await apiClient.hubGetRna(organismeRef).then()
    if (organisme) {
      currentOrganisme.value = organisme
      currentType.value = EOrganismeCategory.association
    }
  }

  const setCurrentFondationByRef = async (organismeRef: string) => {
    const organisme = await apiClient.hubGetRnf(organismeRef).then()
    if (organisme) {
      currentOrganisme.value = organisme
      currentType.value = EOrganismeCategory.association
    }
  }

  const setCurrentOrganismeByRef = async (organismeRef: string) => {
    const type = getTypeOrganismeFromRef(organismeRef)
    if (!type) {
      return
    }
    return type === EOrganismeCategory.association
      ? setCurrentAssociationByRef(organismeRef)
      : setCurrentFondationByRef(organismeRef)
  }

  const setOrganisme = (organisme: TOrganisme, type: organismeCategoryKey) => {
    currentOrganisme.value = organisme
    currentType.value = type
    const basicOrganisme = type === EOrganismeCategory.association
      ? fromAssociationToBasicOrganisme(organisme as IAssociationOutput)
      : fromFoundationToBasicOrganisme(organisme as IFoundationOutput)
    apiClient.addConsultedOrganisme(basicOrganisme)
  }

  const clear = () => {
    currentOrganisme.value = null
    currentType.value = null
  }

  return {
    currrentBasicOrganisme,
    currentOrganisme,
    currentType,
    getTypeOrganismeFromRef,
    setCurrentOrganismeByRef,
    setOrganisme,
    clear,
  }
})
