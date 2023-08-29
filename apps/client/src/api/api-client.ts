import axios, { AxiosError } from 'axios'

import type {
  CreateUserDto,
  UpdateUserDto,
  CredentialsInputDto,
  UserOutputDto,
  UpdateUserPasswordDto,
  ResetPasswordInputDto,
} from '@biblio-num/shared'

import { demarchesRoute, getDemarcheByIdRoute, getDossiersFromDemarcheByIdRoute } from './bn-api-routes'
import {
  authRoute,
  createUserRoute,
  getUserByIdRoute,
  profileRoute,
  signInRoute,
  usersRoutes,
} from '@/api/bn-api-routes'

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

export default {
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

  getDossiersFromDemarche: async (id: number) => {
    const response = await apiClientInstance.get(getDossiersFromDemarcheByIdRoute(id))
    return response.data
  },

  getDossiers: async (id?: number) => {
    const extPath = id ? `/${id}` : ''
    const config = {
      method: 'get',
      url: `${baseApiUrl}/deprecated/dossiers${extPath}`,
      headers,
    }
    const response = await axios(config)
    return response.data
  },

  getDossier: async (id: number) => {
    const config = {
      method: 'get',
      url: `${baseApiUrl}/dossiers/${id}/detail`,
      headers,
    }
    const response = await axios(config)
    return response.data
  },

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
