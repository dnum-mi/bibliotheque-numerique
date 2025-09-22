import type { ICreateDemarche, IPasswordChangeRequestsOutput, IUpdateDemarche, PasswordRequestsDecisionKey } from '@biblio-num/shared'
import { demarchesRoute, dossierRoute, getDemarcheByIdRoute, organismesRoute, usersRoutes } from './bn-api-routes'
import { apiClientInstance } from './api-client'

const routeCreateDemarche = `${demarchesRoute}/create`
const routeSynchroniseOneDemarche = (id: number) => `${demarchesRoute}/${id}/sync`
const routeSynchroniseOneDossier = (id: number) => `${dossierRoute}/${id}/sync`
const routeSynchroniseOneOrganisme = (id: number) => `${organismesRoute}/${id}/sync`
const routeListPasswordRequests = `${usersRoutes}/password-requests`
const routeManagePasswordRequest = (id: number) => `${routeListPasswordRequests}/${id}/decision`

export const listManualResetPasswordRequests = async (): Promise<IPasswordChangeRequestsOutput[]> => {
  const response = await apiClientInstance.get(routeListPasswordRequests)
  return response?.data
}

export const managePasswordRequest = async (userId: number, action: PasswordRequestsDecisionKey) => {
  apiClientInstance.patch(routeManagePasswordRequest(userId), { action })
}

export const createDemarche = async (dto: ICreateDemarche) => {
  const response = await apiClientInstance.post(routeCreateDemarche, dto)
  return response.data
}

export const synchroniseOneDossier = async (id: number) => {
  const response = await apiClientInstance.patch(routeSynchroniseOneDossier(id))
  return response.data
}

export const synchroniseOneOrganisme = async (id: number) => {
  const response = await apiClientInstance.patch(routeSynchroniseOneOrganisme(id))
  return response.data
}

export const deleteOneOrganisme = async (id: number) => {
  const response = await apiClientInstance.delete(`${organismesRoute}/${id}`)
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
