import type { AxiosResponse } from 'axios'
import axios, { AxiosError } from 'axios'
import useToaster from '@/composables/use-toaster'

import {
  EOrganismeCategory,
} from '@biblio-num/shared'
import type {
  DynamicKeys,
  IAssociationOutput,
  IBasicOrganisme,
  ICreateBnConfiguration,
  ICreateUser,
  ICredentialsInput,
  IDemarcheOption,
  IDossier,
  IDossierFieldsOutput,
  IDossierSearchOutput,
  IFieldSearchOutput,
  IFileOutput,
  IFoundationOutput,
  IGenerateUpdatePasswordLink,
  ILastConsultedOrganisme,
  ILeanDossierOutput,
  IMappingAnonymizedChamp,
  IMappingColumn,
  IMyProfileOutput,
  IPaginated,
  IPaginatedUser,
  IPagination,
  IPaginationSmallDemarche,
  IPaginationUser,
  IResetPasswordInput,
  ISearchDossier,
  IUpdateAnonymizedChamp,
  IUpdateBnConfiguration,
  IUpdateOneFieldConfiguration,
  IUpdateOneRoleOption,
  IUpdateProfile,
  IUpdateUserPassword,
  IUserWithEditableRole,
  IValidateEmail,
  organismeCategoryKey,
  RolesKeys,
} from '@biblio-num/shared'

import {
  attachedFilesRoute,
  bnConfigurationsRoute,
  demarchesRoute,
  enableHubSearchRoute,
  generateUpdatePasswordLinkRoute,
  getDemarcheAnonymizeRoute,
  getDemarcheByIdRoute,
  getDemarcheConfigurationRoute,
  getDemarcheOptionRoute,
  getDemarcheViewRoute,
  getDossierByIdRoute,
  getDossierFilesRoute,
  getDossierFilesSummaryRoute,
  getDossierFromOrganisme,
  getDossierWithFieldsByIdRoute,
  getListDemarcheDossierRoute,
  getListDemarcheFieldRoute,
  getOneViewRoute,
  getOneViewStats,
  getUpdateOneMappingColumnRoute,
  getUserRoleByIdRoute,
  getViewsRoute,
  getXlsxDemarcheDossierRoute,
  getXlsxDemarcheFieldRoute,
  healthRoute,
  hubGetRna,
  hubGetRnf,
  hubSearchOrganisme,
  lastConsultedOrganismeRoute,
  listSmallDemarchesRoutes,
  proConnectCallbackRoute,
  proConnectSignInRoute,
  refreshTokensRoute,
  resetPasswordRoute,
  smallDemarchesRoutes,
  softDeleteDemarcheByIdRoute,
  updateRolesRoute,
  usersListRoute,
  usersPasswordRoute,
} from './bn-api-routes'
import {
  getUserByIdRoute,
  logoutRoute,
  meRoutes,
  signInRoute,
  usersRoutes,
  verifyAuthRoute,
} from '@/api/bn-api-routes'

import { ErrorvalidateEmail } from './ErrorValidEmail'
import { routeNames } from '../router/route-names'
import router from '@/router'
import { useUserStore } from '@/stores'
import type { RouteLocationRaw } from 'vue-router'
import { fabricSyncStateApiClient } from './sync-state-api-client'

const updatePasswordFeedback = {
  401: 'Le token est absent, veuillez fournir un token valide',
  403: 'Token invalide ou expiré, veuillez fournir un token valide',
  400: 'Le nouveau mot de passe ne respecte pas le niveau de sécurité demandé',
  200: 'Le mot de passe a bien été changé',
  default: 'Une erreur inconnue est survenue',
} as const

export const baseApiUrl = import.meta.env?.API_URL || '/api'

export const headers = {
  'Content-Type': 'application/json',
}

export const apiClientInstance = axios.create({
  baseURL: baseApiUrl,
  headers,
  withCredentials: false, // no refresh token inside normal request
})

export const apiClientAuthInstance = axios.create({
  baseURL: baseApiUrl,
  headers,
})

const toaster = useToaster()
let refreshingToken = false
let pendingRequests: (() => void)[] = []

apiClientInstance.interceptors.response.use(
  (r) => r,
  async (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status
    if (!status || status >= 500) {
      toaster.addErrorMessage(error.response?.data?.message ?? 'Une erreur inconnue est survenue')
      if (import.meta.env.DEV) {
        toaster.addMessage({ description: 'Est-ce que le serveur est démarré ?', type: 'info' })
      }
      console.error(error)
      return
    }

    if (status === 401) {
      const originalRequest = error.config
      if (!originalRequest) {
        throw error
      }

      if (refreshingToken) {
        return new Promise((resolve) => {
          pendingRequests.push(() => resolve(apiClientInstance(originalRequest)))
        })
      }

      refreshingToken = true

      try {
        const userStore = useUserStore()
        await userStore.refreshTokens()
        refreshingToken = false

        pendingRequests.forEach((callback) => callback())
        pendingRequests = []

        return apiClientInstance(originalRequest)
      } catch (e) {
        console.error(e)
        refreshingToken = false
        pendingRequests = []

        toaster.addMessage({
          id: 'auth',
          type: 'warning',
          description: 'Vous n’êtes plus connecté, veuillez vous réauthentifier',
        })
        useUserStore().forceResetUser()
        const routeTo: RouteLocationRaw = { name: routeNames.SIGNIN }
        if (!router.currentRoute.value.meta.skipAuth) {
          routeTo.query = { redirect: location.href.replace(location.origin, '') }
        }
        router.push(routeTo)
        return null
      }
    }

    if (status === 403) {
      toaster.addMessage({ type: 'warning', description: 'Vous n’avez pas les droits de faire cette opération' })
      useUserStore().logout()
      const routeTo: RouteLocationRaw = { name: routeNames.SIGNIN }
      router.push(routeTo)
      return null
    }

    if (status === 404) {
      // TODO: un 404 doit rediriger ou afficher un message d'erreur dans une recherche. Pas un toaster
      // toaster.addErrorMessage(error.response?.data?.message ?? 'Ressource introuvable')
      throw error
    }

    throw error
  },
)

apiClientInstance.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    const accessToken = userStore.accessToken

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

const downloadAFile = (response: AxiosResponse) => {
  const blob = new Blob([response.data], { type: response.headers['content-type'] })
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = 'export.xlsx'
  link.click()
  link.remove()
  window.URL.revokeObjectURL(link.href)
  return response.data
}

const getOrRedirectTo404 = async (route: string) => {
  try {
    return (await apiClientInstance.get(route)).data
  } catch (e) {
    if (e instanceof AxiosError && e.response?.status === 404) {
      router.push({ name: routeNames.Page_404 })
    }
  }
}

const getWithoutRedirectTo404 = async (route: string) => {
  return (await apiClientInstance.get(route)).data
}

export const demarchesApiClient = {
  getDemarche: async (id: number) => {
    return getOrRedirectTo404(getDemarcheByIdRoute(id))
  },

  getDemarches: async () => {
    const response = await apiClientInstance.get(demarchesRoute)
    return response?.data
  },

  getSmallDemarches: async () => {
    const response = await apiClientInstance.get(smallDemarchesRoutes)
    return response.data
  },

  listSmallDemarches: async (dto: IPaginationSmallDemarche) => {
    const response = await apiClientInstance.post(listSmallDemarchesRoutes, dto)
    return response.data
  },

  getDemarcheConfiguration: async (demarcheId: number): Promise<IMappingColumn[]> => {
    const response = await apiClientInstance.get(getDemarcheConfigurationRoute(demarcheId))
    return response?.data
  },

  getDemarcheOptions: async (demarcheId: number): Promise<IDemarcheOption> => {
    const response = await apiClientInstance.get(getDemarcheOptionRoute(demarcheId))
    return response?.data
  },

  saveDemarcheOptions: async (demarcheId: number, dto: Partial<IDemarcheOption>): Promise<void> => {
    await apiClientInstance.patch(getDemarcheOptionRoute(demarcheId), dto)
  },

  searchDemarcheFields: async (demarcheId: number, dto: ISearchDossier): Promise<IFieldSearchOutput> => {
    const response = await apiClientInstance.post(getListDemarcheFieldRoute(demarcheId), dto)
    return response?.data
  },

  exportDemarcheFields: async (demarcheId: number, dto: ISearchDossier): Promise<void> => {
    downloadAFile(await apiClientInstance.post(getXlsxDemarcheFieldRoute(demarcheId), dto, { responseType: 'blob' }))
  },

  softDeleteDemarche (id: number): Promise<void> {
    return apiClientInstance.patch(softDeleteDemarcheByIdRoute(id))
  },

  getAnonymizedChamps: async (id: number): Promise<IMappingAnonymizedChamp[]> => {
    const response = await apiClientInstance.get(getDemarcheAnonymizeRoute(id))
    return response?.data
  },

  updateOneMappingAnonymized (id: number, dto: IUpdateAnonymizedChamp) {
    return apiClientInstance.patch(getDemarcheAnonymizeRoute(id), dto)
  },
}

export const usersApiClient = {
  async createUser (userData: ICreateUser) {
    const response = await apiClientInstance.post(usersRoutes, userData)
    return response?.data
  },

  async updatePassword (updateUserPassword: IUpdateUserPassword) {
    try {
      const response = await apiClientAuthInstance.put(usersPasswordRoute, updateUserPassword)
      return response?.data
    } catch (error) {
      if (error && error instanceof AxiosError) {
        const feedbackCode = String(error.response?.status) as keyof typeof updatePasswordFeedback
        throw new Error(updatePasswordFeedback[feedbackCode] ?? updatePasswordFeedback.default)
      }
      throw error
    }
  },

  async loginUser (
    loginForm: ICredentialsInput,
  ): Promise<
    | { accessToken: string; message?: string }
    | { error: AxiosError }
  > {
    try {
      const response = await apiClientAuthInstance.post(signInRoute, loginForm)
      return response.data
    } catch (error) {
      return { error: error as AxiosError }
    }
  },

  async loginWithVerifyAuth (token: string): Promise<{ accessToken: string }> {
    const response = await apiClientAuthInstance.post(verifyAuthRoute, { token })
    return response.data
  },

  async logoutUser (): Promise<void> {
    return apiClientInstance.delete(logoutRoute, { withCredentials: true })
  },

  async refreshTokens (): Promise<{ accessToken: string }> {
    const response = await apiClientAuthInstance.post(refreshTokensRoute, {}, { withCredentials: true })
    return response.data
  },

  async fetchMyProfile (): Promise<IMyProfileOutput | null> {
    try {
      const response = await apiClientInstance.get(meRoutes)
      return response?.data
    } catch {
      return null
    }
  },

  async updateMyProfile (dto: IUpdateProfile) {
    await apiClientInstance.patch(meRoutes, dto)
  },

  async listUsers (dto: IPaginationUser): Promise<IPaginatedUser> {
    const response = await apiClientInstance.post(usersListRoute, dto)
    return response?.data
  },

  async getUserById (id: number): Promise<IUserWithEditableRole | null> {
    const response = await apiClientInstance.get(getUserByIdRoute(id))
    return response?.data
  },

  async getUserRoleById (id: number): Promise<IUserWithEditableRole | null> {
    const response = await apiClientInstance.get(getUserRoleByIdRoute(id))
    return response?.data
  },

  async resetPassword (resetPasswordInput: IResetPasswordInput) {
    apiClientAuthInstance.post(resetPasswordRoute, resetPasswordInput)
  },

  async generateUpdatePasswordLink (id: number): Promise<IGenerateUpdatePasswordLink> {
    const response = await apiClientInstance.get(generateUpdatePasswordLinkRoute(id))
    return response?.data
  },

  async loginWithProconnect () {
    const response = await apiClientAuthInstance.get(proConnectSignInRoute)
    return response?.data
  },

  async proConnectCallback (code: string, state: string, iss: string): Promise<{ accessToken: string }> {
    const response = await apiClientAuthInstance.post(
      proConnectCallbackRoute,
      {
        code,
        state,
        iss,
      },
    )

    return response?.data
  },

  async validEmail (token: string) {
    try {
      const validateEmail: IValidateEmail = {
        validate: true,
        token,
      }
      await apiClientInstance.post('/users/me/valid-email', validateEmail)
    } catch (error) {
      if (error && error instanceof AxiosError) {
        throw new ErrorvalidateEmail(error)
      }
      throw error
    }
  },

  async updateUserRole (id: number, role: RolesKeys) {
    await apiClientInstance.put(getUserRoleByIdRoute(id), { role })
  },

  async updateUserDemarchesRole (id: number, dto: IUpdateOneRoleOption) {
    await apiClientInstance.patch(getUserRoleByIdRoute(id), dto)
  },

  async updateUserDemarchesRoles (id: number, dtos: IUpdateOneRoleOption[]) {
    await apiClientInstance.patch(updateRolesRoute(id), dtos)
  },

  async removeRole (id: number) {
    await apiClientInstance.delete(getUserRoleByIdRoute(id))
  },

  async getLastConsultedOrganisme (): Promise<ILastConsultedOrganisme[]> {
    return (await apiClientInstance.get(lastConsultedOrganismeRoute))?.data || []
  },

  async addConsultedOrganisme (dto: IBasicOrganisme) {
    await apiClientInstance.post(lastConsultedOrganismeRoute, dto)
  },
}

export const dossiersApiClient = {
  updateOneMappingColumn: async (demarcheId: number, fieldId: string, dto: IUpdateOneFieldConfiguration) => {
    return apiClientInstance.patch(getUpdateOneMappingColumnRoute(demarcheId, fieldId), dto)
  },

  getDossier: async (id: number): Promise<IDossier> => getOrRedirectTo404(getDossierByIdRoute(id)),

  getDossierWithFields: async (id: number): Promise<IDossierFieldsOutput> => getOrRedirectTo404(getDossierWithFieldsByIdRoute(id)),

  getOrganismeDossiers: async (organismeId: string): Promise<ILeanDossierOutput[]> =>
    (await apiClientInstance.get(getDossierFromOrganisme(organismeId))).data,

  searchDemarcheDossiers: async (demarcheId: number, dto: ISearchDossier): Promise<IDossierSearchOutput> => {
    const response = await apiClientInstance.post(getListDemarcheDossierRoute(demarcheId), dto)
    return response?.data
  },

  exportDemarcheDossiers: async (demarcheId: number, dto: ISearchDossier): Promise<void> => {
    downloadAFile(await apiClientInstance.post(getXlsxDemarcheDossierRoute(demarcheId), dto, { responseType: 'blob' }))
  },

  getDossierFiles:
    (dossierId: number) =>
      async (params: IPagination<IFileOutput>): Promise<IPaginated<IFileOutput>> => {
        const response = await apiClientInstance.post(getDossierFilesRoute(dossierId), params)
        return response?.data
      },

  getDossierFilesSummary: async (dossierId: number): Promise<number> => {
    return (await apiClientInstance.get(getDossierFilesSummaryRoute(dossierId))).data
  },
}

export const viewsApiClient = {
  getViews: async (): Promise<ICustomFilter[]> => {
    const response = await apiClientInstance.get(getViewsRoute())
    return response?.data
  },

  getViewByDemarche: async (demarcheId: number): Promise<ICustomFilter[]> => {
    const response = await apiClientInstance.get(getDemarcheViewRoute(demarcheId))
    return response?.data
  },

  createOneView: async (dto: ICreateCustomFilter, demarcheId: number) => {
    const response = await apiClientInstance.post(getDemarcheViewRoute(demarcheId), dto)
    return response?.data
  },

  updateOneView: async (id: number, dto: IPatchCustomFilter) => {
    const response = await apiClientInstance.patch(getOneViewRoute(id), dto)
    return response?.data
  },

  deleteOneView: async (id: number) => {
    const response = await apiClientInstance.delete(getOneViewRoute(id))
    return response?.data
  },
  getViewStats: async (id: number) => {
    const response = await apiClientInstance.get(getOneViewStats(id))
    return response?.data
  },
}

export const healthApiClient = {
  getHealth: async () => {
    const response = await apiClientInstance.get(healthRoute)
    return response?.data
  },
}

export const bnConfigurationsApiClient = {
  getBnConfigurations: async () => {
    const response = await apiClientInstance.get(bnConfigurationsRoute)
    return response?.data
  },

  createBnConfiguration: async (dto: ICreateBnConfiguration) => {
    const response = await apiClientInstance.post(bnConfigurationsRoute, dto)
    return response?.data
  },

  updateBnConfiguration: async (id: number, dto: IUpdateBnConfiguration) => {
    const response = await apiClientInstance.patch(`${bnConfigurationsRoute}/${id}`, dto)
    return response?.data
  },

  getEnableHubSearch: async () => {
    const response = await apiClientInstance.get(enableHubSearchRoute)
    return response?.data
  },

}

export const attachedFilesApiClient = {
  getAttachedFiles: async (params: IPagination<DynamicKeys>): Promise<IFileOutput[]> => {
    const response = await apiClientInstance.post(attachedFilesRoute, params)
    return response?.data
  },

  getAttachmentFile: async (uuid: string) => {
    const response = await apiClientInstance.get(`/files/${uuid}`, { responseType: 'blob' })
    return response
  },
}

export const hubApiClient = {
  searchOrganisme: (sentence: string): Promise<IBasicOrganisme[]> => {
    return getOrRedirectTo404(hubSearchOrganisme(sentence))
  },
  hubGetFile: (type: organismeCategoryKey, organismeId: string, id: string) => {
    const correctType = type === EOrganismeCategory.association ? 'association' : 'foundation'
    return apiClientInstance.get(`/hub/${correctType}/${organismeId}/file/${id}`, { responseType: 'blob' })
  },
  hubGetMultipleFiles: (type: organismeCategoryKey, organismeId: string, fileIds: string[]) => {
    const correctType = type === EOrganismeCategory.association ? 'association' : 'foundation'
    return apiClientInstance.post(
      `/hub/${correctType}/${organismeId}/files`,
      { fileIds },
      { responseType: 'blob' },
    )
  },
  hubGetRna: (sentence: string): Promise<IFoundationOutput> => {
    return getWithoutRedirectTo404(hubGetRna(sentence))
  },
  hubGetRnf: (sentence: string): Promise<IAssociationOutput> => {
    return getWithoutRedirectTo404(hubGetRnf(sentence))
  },
  hubExportOrganisme: (type: organismeCategoryKey, organismeId: string) => {
    const correctType = type === EOrganismeCategory.association ? 'association' : 'foundation'
    return apiClientInstance.get(`/hub/${correctType}/${organismeId}/export-pdf`, { responseType: 'blob' })
  },
}

// TODO: c'est possible de découper se fichier ?!
export default {
  ...demarchesApiClient,
  ...usersApiClient,
  ...dossiersApiClient,
  ...viewsApiClient,
  ...healthApiClient,
  ...attachedFilesApiClient,
  ...hubApiClient,
  ...(fabricSyncStateApiClient(apiClientInstance)),
}
