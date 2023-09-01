import axios, { AxiosError } from 'axios'

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
} from '@biblio-num/shared'

import {
  assignRoleRoute,
  demarchesRoute,
  getDemarcheByIdRoute,
  getDemarcheConfigurationRoute,
  getDossiersFromDemarcheByIdRoute,
  getOrganismeByIdRnaRoute,
  getOrganismeByIdRoute,
  getRoleByIdRoute,
  getUpdateOneMappingColumnRoute,
  organismesRoute,
  rolesRoute,
  unassignRoleRoute,
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

  getDemarcheConfiguration: async (demarcheId: number): Promise<MappingColumn[]> => {
    const response = await apiClientInstance.get(getDemarcheConfigurationRoute(demarcheId))
    return response.data
  },

  searchDemarcheFields: async (demarcheId: number, dto: SearchDossierDto): Promise<FieldSearchOutputDto> => {
    const response = await apiClientInstance.post(`/demarches/${demarcheId}/fields-search`, dto)
    return response.data
  },
}

export const organismeApiClient = {
  getOrganismes: async () => {
    const response = await apiClientInstance.get(organismesRoute)
    return response.data
  },

  getOrganismeById: async (organismeId: number) => {
    const response = await apiClientInstance.get(getOrganismeByIdRoute(organismeId))
    return response.data
  },

  getOrganismeByIdRna: async (organismeIdRna: string) => {
    const response = await apiClientInstance.get(getOrganismeByIdRnaRoute(organismeIdRna))
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
}

export const dossiersApiClient = {
  getDossiersFromDemarche: async (id: number) => {
    const response = await apiClientInstance.get(getDossiersFromDemarcheByIdRoute(id))
    return response.data
  },

  updateOneMappingColumn: async (demarcheId: number, fieldId: string, dto: UpdateOneFieldConfigurationDto) => {
    return apiClientInstance.patch(getUpdateOneMappingColumnRoute(demarcheId, fieldId), dto)
  },

  searchDemarcheDossiers: async (demarcheId: number, dto: SearchDossierDto): Promise<DossierSearchOutputDto> => {
    const response = await apiClientInstance.post(`/demarches/${demarcheId}/dossiers-search`, dto)
    return response.data
  },

  getDossier: async (id: number) => {
    const response = await apiClientInstance.get(`/dossiers/${id}/detail`)
    return response.data
  },
}

export default {
  ...rolesApiClient,
  ...demarchesApiClient,
  ...organismeApiClient,
  ...usersApiClient,
  ...dossiersApiClient,
}
