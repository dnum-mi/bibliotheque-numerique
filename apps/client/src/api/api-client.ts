import axios, { AxiosError, type AxiosResponse } from 'axios'

import useToaster from '@/composables/use-toaster'

import type {
  ICreateUser,
  ICredentialsInput,
  IDossierSearchOutput,
  IFieldSearchOutput,
  IResetPasswordInput,
  ISearchDossier,
  IUpdateOneFieldConfiguration,
  IUpdateUserPassword,
  IUserOutput,
  ICreateCustomFilter,
  IPatchCustomFilter,
  IValidateEmail,
  IFileOutput,
  ILeanDossierOutput,
  IPagination,
  IPaginationUser,
  IPaginatedUser,
  IMyProfileOutput,
  IUpdateOneRoleOption,
  ISmallDemarcheOutput,
  IUpdateProfile,

  IUserWithEditableRole,
  ICustomFilter,
  IOrganisme,
  IMappingColumn,
  IDossier,
  DynamicKeys,
  RolesKeys,
  ICreateBnConfiguration,
  IUpdateBnConfiguration,
  IPaginated,
} from '@biblio-num/shared'

import {
  demarchesRoute,
  getDemarcheByIdRoute,
  getDemarcheConfigurationRoute,
  getUpdateOneMappingColumnRoute,
  getCustomFiltersRoute,
  getOneCustomFiltersRoute,
  getOneCustomFiltersStats,
  smallDemarchesRoutes,
  getListDemarcheDossierRoute,
  getListDemarcheFieldRoute,
  getXlsxDemarcheDossierRoute,
  getXlsxDemarcheFieldRoute,
  getDemarcheCustomFilterRoute,
  getDossierByIdRoute,
  getOrganismeDossiers,
  getOrganismeByIdRoute,
  getOrganismeByRnaRoute,
  getOrganismeByRnfRoute,
  organismesListRoute,
  usersListRoute,
  bnConfigurationsRoute,
  getUserRoleByIdRoute,
  healthRoute,
  organismesListXlsxRoute,
  attachedFilesRoute,
  getOrganismeFilesSummaryRoute,
  getOrganismeFilesRoute,
} from './bn-api-routes'
import {
  authRoute,
  getUserByIdRoute,
  profileRoute,
  signInRoute,
  usersRoutes,
} from '@/api/bn-api-routes'

import { ErrorvalidateEmail } from './ErrorValidEmail'
import { routeNames } from '../router/route-names'
import router from '@/router'
import { useUserStore } from '@/stores'
import type { RouteLocationRaw } from 'vue-router'

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
})

export const apiClientAuthInstance = axios.create({
  baseURL: baseApiUrl,
  headers,
})

const toaster = useToaster()
apiClientInstance.interceptors.response.use(r => r, (error: AxiosError<{ message?: string }>) => {
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
    toaster.addMessage({ id: 'auth', type: 'warning', description: 'Vous n’êtes plus connecté, veuillez vous réauthentifier' })
    useUserStore().forceResetUser()
    const routeTo: RouteLocationRaw = { name: routeNames.SIGNIN }
    if (!router.currentRoute.value.meta.skipAuth) {
      routeTo.query = { redirect: location.href.replace(location.origin, '') }
    }
    router.push(routeTo)
    return null
  }
  if (status === 403) {
    toaster.addMessage({ type: 'warning', description: 'Vous n’avez pas les droits de faire cette opération' })
    return null
  }
  if (status === 404) {
    toaster.addErrorMessage(error.response?.data?.message ?? 'Ressource introuvable')
    throw error
  }
  if (status >= 400 && status < 500 && error.response?.data?.message) {
    toaster.addErrorMessage(error.response?.data?.message)
    return null
  }
})

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

export const demarchesApiClient = {
  getDemarche: async (id: number) => {
    return getOrRedirectTo404(getDemarcheByIdRoute(id))
  },

  getDemarches: async () => {
    const response = await apiClientInstance.get(demarchesRoute)
    return response?.data
  },

  getSmallDemarches: async (): Promise<ISmallDemarcheOutput[]> => {
    return (await apiClientInstance.get(smallDemarchesRoutes)).data
  },

  getDemarcheConfiguration: async (demarcheId: number): Promise<IMappingColumn[]> => {
    const response = await apiClientInstance.get(getDemarcheConfigurationRoute(demarcheId))
    return response.data
  },

  searchDemarcheFields: async (demarcheId: number, dto: ISearchDossier): Promise<IFieldSearchOutput> => {
    const response = await apiClientInstance.post(getListDemarcheFieldRoute(demarcheId), dto)
    return response.data
  },

  exportDemarcheFields: async (demarcheId: number, dto: ISearchDossier): Promise<void> => {
    downloadAFile(await apiClientInstance.post(getXlsxDemarcheFieldRoute(demarcheId), dto, { responseType: 'blob' }))
  },
}

export const organismeApiClient = {
  getOrganismes: async (dto: IPagination<IOrganisme>) => {
    const response = await apiClientInstance.post(organismesListRoute, dto)
    return response.data
  },

  getOrganismeById: async (organismeId: string): Promise<IOrganisme> => {
    return getOrRedirectTo404(getOrganismeByIdRoute(+organismeId))
  },

  getOrganismeByRna: async (organismeIdRna: string): Promise<IOrganisme> => {
    return getOrRedirectTo404(getOrganismeByRnaRoute(organismeIdRna))
  },

  getOrganismeByRnf: async (organismeIdRnf: string): Promise<IOrganisme> => {
    return getOrRedirectTo404(getOrganismeByRnfRoute(organismeIdRnf))
  },

  getOrganismeFilesSummary: async (organismeId: string): Promise<Record<string, number>> => {
    return (await apiClientInstance.get(getOrganismeFilesSummaryRoute(organismeId))).data
  },

  getOrganismeFiles: (organismeId: string) => async (params: IPagination<IFileOutput>): Promise<IPaginated<IFileOutput>> => {
    const response = await apiClientInstance.post(getOrganismeFilesRoute(organismeId), params)
    return response.data
  },

  exportOrganismes: async (dto: IPagination<IOrganisme>): Promise<void> => {
    downloadAFile(await apiClientInstance.post(organismesListXlsxRoute, dto, { responseType: 'blob' }))
  },
}

export const usersApiClient = {
  async createUser (userData: ICreateUser) {
    const response = await apiClientInstance.post(usersRoutes, userData)
    return response.data
  },

  async updatePassword (updateUserPassword: IUpdateUserPassword) {
    try {
      const response = await apiClientAuthInstance.put(usersRoutes, updateUserPassword)
      return response?.data
    } catch (error) {
      if (error && error instanceof AxiosError) {
        const feedbackCode = (String(error.response?.status)) as keyof typeof updatePasswordFeedback
        throw new Error(updatePasswordFeedback[feedbackCode] ?? updatePasswordFeedback.default)
      }
      throw error
    }
  },

  async loginUser (loginForm: ICredentialsInput): Promise<IUserOutput> {
    const response = await apiClientAuthInstance.post(signInRoute, loginForm, { withCredentials: true })
    return response.data
  },

  logoutUser () {
    return apiClientInstance.delete(authRoute)
  },

  async fetchMyProfile (): Promise<IMyProfileOutput | null> {
    try {
      const response = await apiClientInstance.get(profileRoute)
      return response.data
    } catch (error) {
      return null
    }
  },

  async updateMyProfile (dto: IUpdateProfile) {
    await apiClientInstance.patch(profileRoute, dto)
  },

  async listUsers (dto: IPaginationUser): Promise<IPaginatedUser> {
    const response = await apiClientInstance.post(usersListRoute, dto)
    return response.data
  },

  async getUserById (id: number): Promise<IUserWithEditableRole | null> {
    const response = await apiClientInstance.get(getUserByIdRoute(id))
    return response.data
  },

  async getUserRoleById (id: number): Promise<IUserWithEditableRole | null> {
    const response = await apiClientInstance.get(getUserRoleByIdRoute(id))
    return response.data
  },

  async resetPassword (resetPasswordInput: IResetPasswordInput) {
    apiClientAuthInstance.post('/users/reset-password', resetPasswordInput)
  },

  async validEmail (token: string) {
    try {
      const validateEmail: IValidateEmail = {
        validate: true,
        token,
      }
      const response = await apiClientInstance.post('/users/valid-email', validateEmail)
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

  async removeRole (id:number) {
    await apiClientInstance.delete(getUserRoleByIdRoute(id))
  },

}

export const dossiersApiClient = {
  updateOneMappingColumn: async (demarcheId: number, fieldId: string, dto: IUpdateOneFieldConfiguration) => {
    return apiClientInstance.patch(getUpdateOneMappingColumnRoute(demarcheId, fieldId), dto)
  },

  getDossier: async (id: number): Promise<IDossier> => getOrRedirectTo404(getDossierByIdRoute(id)),

  getOrganismeDossiers: async (organismeId: number): Promise<ILeanDossierOutput[]> =>
    (await apiClientInstance.get(getOrganismeDossiers(organismeId))).data,

  searchDemarcheDossiers: async (demarcheId: number, dto: ISearchDossier): Promise<IDossierSearchOutput> => {
    const response = await apiClientInstance.post(getListDemarcheDossierRoute(demarcheId), dto)
    return response.data
  },

  exportDemarcheDossiers: async (demarcheId: number, dto: ISearchDossier): Promise<void> => {
    downloadAFile(await apiClientInstance.post(getXlsxDemarcheDossierRoute(demarcheId), dto, { responseType: 'blob' }))
  },
}

export const customFiltersApiClient = {
  getCustomFilters: async (): Promise<ICustomFilter[]> => {
    const response = await apiClientInstance.get(getCustomFiltersRoute())
    return response?.data
  },

  getCustomFiltersByDemarche: async (demarcheId: number): Promise<ICustomFilter[]> => {
    const response = await apiClientInstance.get(getDemarcheCustomFilterRoute(demarcheId))
    return response.data
  },

  createOneCustomFilter: async (dto: ICreateCustomFilter, demarcheId: number) => {
    const response = await apiClientInstance.post(getDemarcheCustomFilterRoute(demarcheId), dto)
    return response.data
  },

  updateOneCustomFilter: async (id: number, dto: IPatchCustomFilter) => {
    const response = await apiClientInstance.patch(getOneCustomFiltersRoute(id), dto)
    return response.data
  },

  deleteOneCustomFilter: async (id: number) => {
    const response = await apiClientInstance.delete(getOneCustomFiltersRoute(id))
    return response.data
  },
  getCustomFilterStats: async (id: number) => {
    const response = await apiClientInstance.get(getOneCustomFiltersStats(id))
    return response.data
  },
}

export const healthApiClient = {
  getHealth: async () => {
    const response = await apiClientInstance.get(healthRoute)
    return response.data
  },
}

export const bnConfigurationsApiClient = {
  getBnConfigurations: async () => {
    const response = await apiClientInstance.get(bnConfigurationsRoute)
    return response.data
  },

  createBnConfiguration: async (dto: ICreateBnConfiguration) => {
    const response = await apiClientInstance.post(bnConfigurationsRoute, dto)
    return response.data
  },

  updateBnConfiguration: async (id: number, dto: IUpdateBnConfiguration) => {
    const response = await apiClientInstance.patch(bnConfigurationsRoute + `/${id}`, dto)
    return response.data
  },
}

export const attachedFilesApiClient = {
  getAttachedFiles: async (params: IPagination<DynamicKeys>): Promise<IFileOutput[]> => {
    const response = await apiClientInstance.post(attachedFilesRoute, params)
    return response.data
  },
}

export default {
  ...demarchesApiClient,
  ...organismeApiClient,
  ...usersApiClient,
  ...dossiersApiClient,
  ...customFiltersApiClient,
  ...healthApiClient,
  ...attachedFilesApiClient,
}
