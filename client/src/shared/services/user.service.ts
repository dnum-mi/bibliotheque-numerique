import type { LoginForm, User, UserForm } from '../interfaces'

const API_HOST = import.meta.env?.API_URL || 'http://localhost:3000'
const AUTH_BASE_URL = `${API_HOST}/auth`
const SIGN_UP_URL = `${AUTH_BASE_URL}/sign_up`
const SIGN_IN_URL = `${AUTH_BASE_URL}/sign_in`
const AUTH_PROFIL_URL = `${AUTH_BASE_URL}/profile`
const HEADERS = {
  'Content-Type': 'application/json',
}

export async function createUser (userForm: UserForm) {
  const response = await fetch(SIGN_UP_URL, {
    method: 'POST',
    body: JSON.stringify(userForm),
    headers: HEADERS,
  })
  if (response.ok) {
    return response.json()
  } else {
    throw await response.json()
  }
}

export async function login (loginForm: LoginForm): Promise<User> {
  const response = await fetch(SIGN_IN_URL, {
    method: 'POST',
    body: JSON.stringify(loginForm),
    headers: HEADERS,
  })
  if (response.ok) {
    return await response.json()
  } else {
    throw await response.json()
  }
}

export async function logout () {
  await fetch(AUTH_BASE_URL, {
    method: 'DELETE',
  })
}

export async function fetchCurrentUser (): Promise<User | null> {
  const response = await fetch(AUTH_PROFIL_URL)
  if (response.ok) {
    return response.json()
  } else {
    return null
  }
}
