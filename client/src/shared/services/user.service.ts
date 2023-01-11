import type { LoginForm, User, UserForm } from '../interfaces'
import axios from 'axios'

const API_HOST = import.meta.env?.API_URL || 'http://localhost:3000'
const AUTH_BASE_URL = `${API_HOST}/auth`
const SIGN_UP_URL = `${AUTH_BASE_URL}/sign_up`
const SIGN_IN_URL = `${AUTH_BASE_URL}/sign_in`
const AUTH_PROFIL_URL = `${AUTH_BASE_URL}/profile`
const HEADERS = {
  'Content-Type': 'application/json',
}

export async function createUser (userForm: UserForm) {
  try {
    const response = await axios({
      method: 'post',
      url: SIGN_UP_URL,
      data: JSON.stringify(userForm),
      headers: HEADERS,
    })
    return response.data
  } catch (error) {
    throw await error
  }
}

export async function loginUser (loginForm: LoginForm): Promise<User> {
  try {
    const response = await axios({
      method: 'post',
      url: SIGN_IN_URL,
      data: JSON.stringify(loginForm),
      headers: HEADERS,
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

export async function fetchCurrentUser (): Promise<User | null> {
  try {
    const response = await axios(AUTH_PROFIL_URL)
    return response.data
  } catch (error) {
    return null
  }
}
