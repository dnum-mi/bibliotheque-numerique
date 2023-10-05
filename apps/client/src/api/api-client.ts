import axios, { AxiosError, type AxiosResponse } from 'axios'

import type {
  CreateUserDto,
  CredentialsInputDto,
  DossierSearchOutputDto,
  FieldSearchOutputDto,
  MappingColumn,
  ResetPasswordInputDto,
  SearchDossierDto,
  UpdateOneFieldConfigurationDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
  UserOutputDto,
  CreateCustomFilterDto,
  PatchCustomFilterDto,
  ValidateEmailDto,
  LeanDossierOutputDto, IOrganisme,
  PaginationDto,
} from '@biblio-num/shared'

import {
  assignRoleRoute,
  demarchesRoute,
  getDemarcheByIdRoute,
  getDemarcheConfigurationRoute,
  getRoleByIdRoute,
  getUpdateOneMappingColumnRoute,
  organismesRoute,
  rolesRoute,
  unassignRoleRoute,
  getCustomFiltersRoute,
  getOneCustomFiltersRoute,
  smallDemarchesRoutes,
  getListDemarcheDossierRoute,
  getListDemarcheFieldRoute,
  getXlsxDemarcheDossierRoute,
  getXlsxDemarcheFieldRoute,
  getDossierDetail,
  getOrganismeDossiers,
  getOrganismeByIdRoute,
  getCustomFiltersByDemarcheRoute,
  getOrganismeByRnaRoute,
  getOrganismeByRnfRoute, organismesListRoute,
} from './bn-api-routes'
import {
  authRoute,
  createUserRoute,
  getUserByIdRoute,
  profileRoute,
  signInRoute,
  usersRoutes,
} from '@/api/bn-api-routes'
import type { IRoleForm } from '@/shared/interfaces'

import { ErrorvalidateEmail } from './ErrorValidEmail'
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

export const rolesApiClient = {
  getRoles: async () => {
    const response = await apiClientInstance.get(rolesRoute)
    return response.data
  },

  getRoleById: async (roleId: number) => {
    const response = await apiClientInstance.get(getRoleByIdRoute(roleId))
    return response.data
  },

  upsertRole: async (role: IRoleForm, id?: number) => {
    if (typeof id === 'number') {
      role.id = id
    }
    const response = await apiClientInstance.post(rolesRoute, { role })
    return response.data
  },

  updateRole: async (id: number, role: Partial<IRoleForm>) => {
    const response = await apiClientInstance.put(getRoleByIdRoute(id), { role })
    return response.data
  },

  deleteRole: async (id: number) => {
    const response = await apiClientInstance.delete(getRoleByIdRoute(id))
    return response.data
  },

  assignRole: async (userId: number, roleId: number) => {
    try {
      await apiClientInstance.post(assignRoleRoute, { userId, roleId })
      return true
    } catch {
      return false
    }
  },

  unassignRole: async (userId: number, roleId: number) => {
    try {
      await apiClientInstance.post(unassignRoleRoute, { userId, roleId })
      return true
    } catch {
      return false
    }
  },
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
    return response.data
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
    const response = await apiClientInstance.post(createUserRoute, userData)
    return response.data
  },

  async updatePassword (updateUserPassword: UpdateUserPasswordDto) {
    try {
      const response = await apiClientInstance.put(createUserRoute, updateUserPassword)
      return response.data
    } catch (error) {
      if (error && error instanceof AxiosError) {
        const feedbackCode = (String(error.response?.status)) as keyof typeof updatePasswordFeedback
        throw new Error(updatePasswordFeedback[feedbackCode] ?? updatePasswordFeedback.default)
      }
      throw error
    }
  },

  async loginUser (loginForm: CredentialsInputDto): Promise<UserOutputDto> {
    const response = await apiClientInstance.post(signInRoute, loginForm, { withCredentials: true })
    return response.data
  },

  logoutUser () {
    return apiClientInstance.delete(authRoute)
  },

  async fetchCurrentUser (): Promise<UpdateUserDto | null> {
    try {
      const response = await apiClientInstance.get(profileRoute)
      return response.data
    } catch (error) {
      return null
    }
  },

  async getUsers (): Promise<UpdateUserDto[] | null> {
    const response = await apiClientInstance.get(usersRoutes)
    return response.data
  },

  async getUserById (id: number): Promise<UpdateUserDto | null> {
    const response = await apiClientInstance.get(getUserByIdRoute(id))
    return response.data
  },

  async resetPassword (resetPasswordInput: ResetPasswordInputDto) {
    apiClientInstance.post('/users/reset-password', resetPasswordInput)
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
}

export const dossiersApiClient = {
  updateOneMappingColumn: async (demarcheId: number, fieldId: string, dto: UpdateOneFieldConfigurationDto) => {
    return apiClientInstance.patch(getUpdateOneMappingColumnRoute(demarcheId, fieldId), dto)
  },

  getDossier: async (id: number) =>
    (await apiClientInstance.get(getDossierDetail(id))).data,

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
  getCustomFilters: async () => {
    const response = await apiClientInstance.get(getCustomFiltersRoute())
    return response.data
  },

  getCustomFiltersByDemarche: async (id: number) => {
    const response = await apiClientInstance.get(getCustomFiltersByDemarcheRoute(id))
    return response.data
  },

  createOneCustomFilter: async (dto: CreateCustomFilterDto, demarcheId: number) => {
    const response = await apiClientInstance.post(getCustomFiltersByDemarcheRoute(demarcheId), dto)
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
}

export default {
  ...rolesApiClient,
  ...demarchesApiClient,
  ...organismeApiClient,
  ...usersApiClient,
  ...dossiersApiClient,
  ...customFiltersApiClient,
}
