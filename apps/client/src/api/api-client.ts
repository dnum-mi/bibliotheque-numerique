import axios, { AxiosError, type AxiosResponse } from 'axios'

import useToaster from '@/composables/use-toaster'

import type {
  CreateUserDto,
  CredentialsInputDto,
  DossierSearchOutputDto,
  FieldSearchOutputDto,
  MappingColumn,
  ResetPasswordInputDto,
  SearchDossierDto,
  UpdateOneFieldConfigurationDto,
  UpdateUserPasswordDto,
  UserOutputDto,
  CreateCustomFilterDto,
  PatchCustomFilterDto,
  ValidateEmailDto,
  LeanDossierOutputDto,
  IOrganisme,
  PaginationDto,
  PaginationUserDto,
  ICustomFilter,
  IDossier,
  PaginatedUserDto,
  MyProfileOutputDto,
  UserWithEditableRole,
  RolesKeys,
  UpdateOneRoleOptionDto,
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
  getUserRoleByIdRoute,
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

const updatePasswordFeedback = {
  401: 'Le token est absent, veuillez fournir un token valide',
  403: 'Token invalide ou expiré, veuillez fournir un token valide',
  400: 'Le nouveau mot de passe ne respecte pas le niveau de sécurité demandé',
  200: 'Le mot de passe a bien été changé',
  default: 'Une erreur inconnue est survenue',
} as const

const baseApiUrl = import.meta.env?.API_URL || '/api'
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
apiClientInstance.interceptors.response.use(r => r, (error) => {
  if (error.response.status === 401) {
    toaster.addMessage({ type: 'warning', description: 'Vous n’êtes plus connecté, veuillez vous réauthentifier' })
    useUserStore().forceResetUser()
    router.push({ name: routeNames.SIGNIN, query: { redirect: location.href.replace(location.origin, '') } })
    return null
  }
  if (error.response.status === 403) {
    toaster.addMessage({ type: 'warning', description: 'Vous n’avez pas les droits de faire cette opération' })
    return null
  }
  if (error.response.status >= 400 && error.response.status < 500) {
    toaster.addErrorMessage(error.response.data.message)
    return null
  }
  if (error.response.status >= 500) {
    toaster.addErrorMessage(error.response.data?.message ?? 'Une erreur inconnue est survenue')
    import.meta.env.DEV && console.error(error)
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

export const demarchesApiClient = {
  getDemarcheByDsId: async (id: number) => {
    const url = `${demarchesRoute}/ds/${id}`
    const response = await apiClientInstance.get(url)
    return response.data
  },

  getDemarche: async (id: number) => {
    const response = await apiClientInstance.get(getDemarcheByIdRoute(id))
    return response.data
  },

  getDemarches: async () => {
    const response = await apiClientInstance.get(demarchesRoute)
    return response?.data
  },

  getSmallDemarches: async () => {
    return (await apiClientInstance.get(smallDemarchesRoutes)).data
  },

  getDemarcheConfiguration: async (demarcheId: number): Promise<MappingColumn[]> => {
    const response = await apiClientInstance.get(getDemarcheConfigurationRoute(demarcheId))
    return response.data
  },

  searchDemarcheFields: async (demarcheId: number, dto: SearchDossierDto): Promise<FieldSearchOutputDto> => {
    const response = await apiClientInstance.post(getListDemarcheFieldRoute(demarcheId), dto)
    return response.data
  },

  exportDemarcheFields: async (demarcheId: number, dto: SearchDossierDto): Promise<void> => {
    downloadAFile(await apiClientInstance.post(getXlsxDemarcheFieldRoute(demarcheId), dto, { responseType: 'blob' }))
  },
}

export const organismeApiClient = {
  getOrganismes: async (dto: PaginationDto<IOrganisme>) => {
    const response = await apiClientInstance.post(organismesListRoute, dto)
    return response.data
  },

  getOrganismeById: async (organismeId: string): Promise<IOrganisme> => {
    const response = await apiClientInstance.get(getOrganismeByIdRoute(+organismeId))
    return response.data
  },

  getOrganismeByRna: async (organismeIdRna: string): Promise<IOrganisme> => {
    const response = await apiClientInstance.get(getOrganismeByRnaRoute(organismeIdRna))
    return response.data
  },

  getOrganismeByRnf: async (organismeIdRnf: string): Promise<IOrganisme> => {
    const response = await apiClientInstance.get(getOrganismeByRnfRoute(organismeIdRnf))
    return response.data
  },
}

export const usersApiClient = {
  async createUser (userData: CreateUserDto) {
    const response = await apiClientInstance.post(usersRoutes, userData)
    return response.data
  },

  async updatePassword (updateUserPassword: UpdateUserPasswordDto) {
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

  async loginUser (loginForm: CredentialsInputDto): Promise<UserOutputDto> {
    const response = await apiClientAuthInstance.post(signInRoute, loginForm, { withCredentials: true })
    return response.data
  },

  logoutUser () {
    return apiClientInstance.delete(authRoute)
  },

  async fetchMyProfile (): Promise<MyProfileOutputDto | null> {
    try {
      const response = await apiClientInstance.get(profileRoute)
      return response.data
    } catch (error) {
      return null
    }
  },

  listUsers: async (dto: PaginationUserDto): Promise<PaginatedUserDto> => {
    const response = await apiClientInstance.post(usersListRoute, dto)
    return response.data
  },

  async getUserById (id: number): Promise<UserWithEditableRole | null> {
    const response = await apiClientInstance.get(getUserByIdRoute(id))
    return response.data
  },

  async getUserRoleById (id: number): Promise<UserWithEditableRole | null> {
    const response = await apiClientInstance.get(getUserRoleByIdRoute(id))
    return response.data
  },

  async resetPassword (resetPasswordInput: ResetPasswordInputDto) {
    apiClientAuthInstance.post('/users/reset-password', resetPasswordInput)
  },

  async validEmail (token: string) {
    try {
      const validateEmail: ValidateEmailDto = {
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

  async updateUserDemarchesRole (id: number, dto: UpdateOneRoleOptionDto) {
    await apiClientInstance.patch(getUserRoleByIdRoute(id), dto)
  },

  async removeRole (id:number) {
    await apiClientInstance.delete(getUserRoleByIdRoute(id))
  },
}

export const dossiersApiClient = {
  updateOneMappingColumn: async (demarcheId: number, fieldId: string, dto: UpdateOneFieldConfigurationDto) => {
    return apiClientInstance.patch(getUpdateOneMappingColumnRoute(demarcheId, fieldId), dto)
  },

  getDossier: async (id: number): Promise<IDossier> =>
    (await apiClientInstance.get(getDossierByIdRoute(id))).data,

  getOrganismeDossiers: async (organismeId: number): Promise<LeanDossierOutputDto[]> =>
    (await apiClientInstance.get(getOrganismeDossiers(organismeId))).data,

  searchDemarcheDossiers: async (demarcheId: number, dto: SearchDossierDto): Promise<DossierSearchOutputDto> => {
    const response = await apiClientInstance.post(getListDemarcheDossierRoute(demarcheId), dto)
    return response.data
  },

  exportDemarcheDossiers: async (demarcheId: number, dto: SearchDossierDto): Promise<void> => {
    downloadAFile(await apiClientInstance.post(getXlsxDemarcheDossierRoute(demarcheId), dto, { responseType: 'blob' }))
  },
}

export const customFiltersApiClient = {
  getCustomFilters: async (): Promise<ICustomFilter[]> => {
    const response = await apiClientInstance.get(getCustomFiltersRoute())
    return response.data
  },

  getCustomFiltersByDemarche: async (demarcheId: number): Promise<ICustomFilter[]> => {
    const response = await apiClientInstance.get(getDemarcheCustomFilterRoute(demarcheId))
    return response.data
  },

  createOneCustomFilter: async (dto: CreateCustomFilterDto, demarcheId: number) => {
    const response = await apiClientInstance.post(getDemarcheCustomFilterRoute(demarcheId), dto)
    return response.data
  },

  updateOneCustomFilter: async (id: number, dto: PatchCustomFilterDto) => {
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

export default {
  ...demarchesApiClient,
  ...organismeApiClient,
  ...usersApiClient,
  ...dossiersApiClient,
  ...customFiltersApiClient,
}
