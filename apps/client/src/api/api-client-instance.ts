import type { AxiosError } from 'axios'
import axios from 'axios'
import type { RouteLocationRaw } from 'vue-router'

import useToaster from '@/composables/use-toaster'
import { useUserStore } from '@/stores'
import { routeNames } from '@/router/route-names'
import router from '@/router'

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

        toaster.addMessage({ id: 'auth', type: 'warning', description: 'Vous n’êtes plus connecté, veuillez vous réauthentifier' })
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
      toaster.addErrorMessage(error.response?.data?.message ?? 'Ressource introuvable')
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
