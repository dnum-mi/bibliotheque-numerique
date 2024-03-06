import type { ICreateDemarche, IUpdateDemarche } from '@biblio-num/shared'
import { demarchesRoute, dossierRoute, getDemarcheByIdRoute } from './bn-api-routes'
import { apiClientInstance } from './api-client'

const routeCreateDemarche = `${demarchesRoute}/create`
const routeSynchroniseOneDemarche = (id: number) => `${demarchesRoute}/${id}/sync`
const routeSynchroniseOneDossier = (id: number) => `${dossierRoute}/${id}/sync`

export const createDemarche = async (dto: ICreateDemarche) => {
  const response = await apiClientInstance.post(routeCreateDemarche, dto)
  return response.data
}

export const synchroniseOneDossier = async (id: number) => {
  const response = await apiClientInstance.patch(routeSynchroniseOneDossier(id))
  return response.data
}

export const putSynchronizeOneDemarche = async (demarcheId: number) => {
  const response = await apiClientInstance.put(routeSynchroniseOneDemarche(demarcheId))
  return response.data
}

export const patchDemarche = async (id: number, dto: IUpdateDemarche) => {
  const response = await apiClientInstance.patch(getDemarcheByIdRoute(id), dto)
  return response.data
}

export const getWorkersLogs = async () => {
  const response = await apiClientInstance.get('/job-log')
  return response.data
}
