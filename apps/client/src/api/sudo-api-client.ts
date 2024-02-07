import type { CreateDemarcheDto, UpdateDemarcheDto } from '@biblio-num/shared'
import { demarchesRoute, getDemarcheByIdRoute } from './bn-api-routes'
import { apiClientInstance, demarchesApiClient } from './api-client'

const routeCreateDemarche = `${demarchesRoute}/create`
const routeSynchroniseOneDemarche = (id: number) => `${demarchesRoute}/${id}/sync`

export const createDemarche = async (dto: CreateDemarcheDto) => {
  const response = await apiClientInstance.post(routeCreateDemarche, dto)
  return response.data
}

export const putSynchronizeOneDemarche = async (demarcheId: number) => {
  const response = await apiClientInstance.put(routeSynchroniseOneDemarche(demarcheId))
  return response.data
}

export const patchDemarche = async (id: number, dto: UpdateDemarcheDto) => {
  const response = await apiClientInstance.patch(getDemarcheByIdRoute(id), dto)
  return response.data
}

export const getWorkersLogs = async () => {
  const response = await apiClientInstance.get('/job-log')
  return response.data
}
