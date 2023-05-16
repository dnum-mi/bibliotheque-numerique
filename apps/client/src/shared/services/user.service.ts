import { baseApiUrl, headers } from '../../utils/api-client'
import axios from 'axios'
import type { CredentialsInput, CreateUserDto, UpdateUserDto, UserOutputDto } from '@biblio-num/shared'

const AUTH_BASE_URL = `${baseApiUrl}/auth`
const SIGN_UP_URL = `${AUTH_BASE_URL}/sign_up`
const SIGN_IN_URL = `${AUTH_BASE_URL}/sign_in`
const AUTH_PROFIL_URL = `${AUTH_BASE_URL}/profile`

export async function createUser (userForm: CreateUserDto) {
  try {
    const response = await axios({
      method: 'post',
      url: SIGN_UP_URL,
      data: JSON.stringify(userForm),
      headers,
    })
    return response.data
  } catch (error) {
    throw await error
  }
}

export async function loginUser (loginForm: CredentialsInput): Promise<UserOutputDto> {
  try {
    const response = await axios({
      method: 'post',
      url: SIGN_IN_URL,
      data: JSON.stringify(loginForm),
      headers,
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    throw await error
  }
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
  try {
    const response = await axios(config)
    return response.data
  } catch (error) {
    throw await error
  }
}

export const getUserById = async (id: number): Promise<UpdateUserDto | null> => {
  const config = {
    method: 'get',
    url: `${baseApiUrl}/users/${id}`,
    headers,
  }
  try {
    const response = await axios(config)
    return response.data
  } catch (error) {
    throw await error
  }
}
