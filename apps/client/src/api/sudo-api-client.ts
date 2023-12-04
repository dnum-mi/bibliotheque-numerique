import type { CreateDemarcheDto, UpdateDemarcheDto } from '@biblio-num/shared'
import { demarchesRoute, getDemarcheByIdRoute } from './bn-api-routes'
import { apiClientInstance, demarchesApiClient } from './api-client'

const routeCreateDemarche = `${demarchesRoute}/create`
const routeSynchroDossiers = `${demarchesRoute}/synchro-dossiers`

export const createDemarche = async (dto: CreateDemarcheDto) => {
  const response = await apiClientInstance.post(routeCreateDemarche, dto)
  return response.data
}

export const synchronizeDossiers = async (idDs: number) => {
  const response = await apiClientInstance.post(routeSynchroDossiers, { idDs })
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
