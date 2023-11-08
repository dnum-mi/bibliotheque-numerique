import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import type { CredentialsInputDto, UserOutputDto } from '@biblio-num/shared'

import type { User } from '@/shared/interfaces'
import bnApiClient from '@/api/api-client'
import type {
  CredentialsInputDto,
  UserOutputDto,
  PaginationUserDto,
} from '@biblio-num/shared'

// TODO: enum Roles dans packages/shared n'est pas récupérable
const RolesAdmins = ['admin', 'sudo', 'superadmin']

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<UserOutputDto | null>(null)
  const users = ref<Map<number, UserOutputDto>>(new Map<number, UserOutputDto>())
  const loaded = ref(false)

  const isAuthenticated = computed(() => !!currentUser.value)
  const hasAdminAccess = computed(() => !!(currentUser.value?.role?.label && RolesAdmins.includes(currentUser.value?.role?.label)))
  const canManageRoles = computed(() => hasAdminAccess.value)
  const canAccessDemarches = computed(() => !!(currentUser.value?.role?.label))

  const login = async (loginForm: CredentialsInputDto) => {
    currentUser.value = await bnApiClient.loginUser(loginForm)
  }

  const resetUser = () => {
    currentUser.value = null
  }

  const logout = async () => {
    await bnApiClient.logoutUser()
    resetUser()
  }

  const loadCurrentUser = async () => {
    const user = await bnApiClient.fetchCurrentUser()
    loaded.value = true
    if (!user) {
      currentUser.value = null
      return
    }
    currentUser.value = user
  }

  const listUsers = async (dto: PaginationUserDto) => {
    if (!hasAdminAccess.value) return
    return bnApiClient.listUsers(dto)
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
    listUsers,
    loadUserById,
    getUsersRole,
    resetUser,
  }
})
