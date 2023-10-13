import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import type { User } from '@/shared/interfaces'
import bnApiClient from '@/api/api-client'
import { RoleName } from '@/shared/types/Permission.type'
import type { CredentialsInputDto, UserOutputDto } from '@biblio-num/shared'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const users = ref<Map<number, UserOutputDto>>(new Map<number, UserOutputDto>())
  const loaded = ref(false)

  const isAuthenticated = computed(() => !!currentUser.value)
  const hasAdminAccess = computed(() => !!(currentUser.value?.roles.some(role => role.name === RoleName.ADMIN)))
  const canManageRoles = computed(() => !!currentUser.value?.roles?.find(role => role.name === RoleName.ADMIN || role?.permissions?.find(permission => permission?.name === 'CREATE_ROLE')))
  const canAccessDemarches = computed(() => !!currentUser.value?.roles?.find(role => role.name === RoleName.ADMIN || role?.permissions?.find(permission => permission?.name === 'ACCESS_DEMARCHE')))

  const login = async (loginForm: CredentialsInputDto) => {
    currentUser.value = await bnApiClient.loginUser(loginForm)
  }

  const logout = async () => {
    await bnApiClient.logoutUser()
    currentUser.value = null
  }

  const loadCurrentUser = async () => {
    currentUser.value = await bnApiClient.fetchCurrentUser()
    loaded.value = true
  }

  const loadUsers = async () => {
    if (!hasAdminAccess.value) return
    const userArr = await bnApiClient.getUsers()
    if (!userArr) return
    for (const user of userArr) {
      users.value.set(user.id, user)
    }
  }

  const loadUserById = async (id: number) => {
    if (!hasAdminAccess.value) return
    const user = await bnApiClient.getUserById(id)
    if (!user) return
    users.value.set(user.id, user)
  }

  return {
    currentUser,
    users,
    loaded,
    isAuthenticated,
    hasAdminAccess,
    canManageRoles,
    canAccessDemarches,
    login,
    logout,
    loadCurrentUser,
    loadUsers,
    loadUserById,
  }
})
