import { baseApiUrl, headers } from '../../utils/api-client'
import axios, { AxiosError } from 'axios'
import type {
  CreateUserDto,
  UpdateUserDto,
  CredentialsInputDto,
  UserOutputDto,
  UpdateUserPasswordDto,
} from '@biblio-num/shared'

const AUTH_BASE_URL = `${baseApiUrl}/auth`
const USER_BASE_URL = `${baseApiUrl}/users`
const SIGN_UP_URL = `${USER_BASE_URL}/user`
const SIGN_IN_URL = `${AUTH_BASE_URL}/sign-in`
const AUTH_PROFIL_URL = `${AUTH_BASE_URL}/profile`

export async function createUser (userForm: CreateUserDto) {
  const response = await axios({
    method: 'post',
    url: SIGN_UP_URL,
    data: JSON.stringify(userForm),
    headers,
  })
  return response.data
}

const updatePasswordFeedback = {
  401: 'Le token est absent, veuillez fournir un token valide',
  403: 'Token invalide ou expiré, veuillez fournir un token valide',
  400: 'Le nouveau mot de passe ne respecte pas le niveau de sécurité demandé',
  200: 'Le mot de passe a bien été changé',
  default: 'Une erreur inconnue est survenue',
} as const

export async function updatePassword (updateUserPassword: UpdateUserPasswordDto) {
  try {
    const response = await axios({
      method: 'put',
      url: SIGN_UP_URL,
      data: JSON.stringify(updateUserPassword),
      headers,
    })
    return response.data
  } catch (error) {
    if (error && error instanceof AxiosError) {
      const feedbackCode = (String(error.response?.status)) as keyof typeof updatePasswordFeedback
      console.log(error.response?.status, feedbackCode, error)
      throw new Error(updatePasswordFeedback[feedbackCode] ?? updatePasswordFeedback.default)
    }
    throw error
  }
}

export async function loginUser (loginForm: CredentialsInputDto): Promise<UserOutputDto> {
  const response = await axios({
    method: 'post',
    url: SIGN_IN_URL,
    data: JSON.stringify(loginForm),
    headers,
    withCredentials: true,
  })
  return response.data
}

export async function logoutUser () {
  await axios({
    method: 'delete',
    url: AUTH_BASE_URL,
  })
}

export async function fetchCurrentUser (): Promise<UpdateUserDto | null> {
  try {
    const response = await axios(AUTH_PROFIL_URL)
    return response.data
  } catch (error) {
    return null
  }
}

export const getUsers = async (): Promise<UpdateUserDto[] | null> => {
  const config = {
    method: 'get',
    url: `${baseApiUrl}/users`,
    headers,
  }
  const response = await axios(config)
  return response.data
}

export const getUserById = async (id: number): Promise<UpdateUserDto | null> => {
  const config = {
    method: 'get',
    url: `${baseApiUrl}/users/${id}`,
    headers,
  }
  const response = await axios(config)
  return response.data
}
