import apiClient from '@/api/api-client'
import type { ICreateView, IPatchView, IView } from '@biblio-num/shared'

export const useViewStore = defineStore('view', () => {
  const views = ref<IView[]>([])
  let currentDemarcheId: number
  const getViews = async () => {
    views.value = await apiClient.getViews()
  }

  const getViewsByDemarche = async (demarcheId: number) => {
    currentDemarcheId = demarcheId
    views.value = await apiClient.getViewByDemarche(demarcheId)
  }

  const createView = async (dto: ICreateView, demarcheId: number): Promise<number> => {
    const view = await apiClient.createOneView(dto, demarcheId)
    if (view == null) {
      throw new Error('La création de l’affichage personnalisé a échoué')
    }
    await getViewsByDemarche(demarcheId)
    return view.id
  }

  const updateView = async (id: number, dto: IPatchView) => {
    await apiClient.updateOneView(id, dto)
    if (currentDemarcheId) {
      await getViewsByDemarche(currentDemarcheId)
    }
  }

  const deleteView = async (id: number) => {
    await apiClient.deleteOneView(id)
    if (currentDemarcheId) {
      await getViewsByDemarche(currentDemarcheId)
    }
  }

  const $reset = () => {
    views.value = []
  }
  return {
    $reset,
    views,
    getViews,
    createView,
    updateView,
    deleteView,
    getViewsByDemarche,
  }
})
