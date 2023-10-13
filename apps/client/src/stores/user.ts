import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import type { CredentialsInputDto, UserOutputDto } from '@biblio-num/shared'

import type { User } from '@/shared/interfaces'
import bnApiClient from '@/api/api-client'
import type {
  CredentialsInputDto,
  UserOutputDto,
  PaginatedDto,
  PaginationDto,
  IUser,
} from '@biblio-num/shared'

// TODO: enum Roles dans packages/shared n'est pas récupérable
const RolesAdmins = ['admin', 'sudo', 'superadmin']// [Roles.admin, Roles.sudo, Roles.superadmin]

export const useUserStore = defineStore('user', () => {
  // TODO: A verfier
  // const currentUser = ref<User | null>(null)
  const currentUser = ref<UserOutputDto | null>(null)
  const users = ref<Map<number, UserOutputDto>>(new Map<number, UserOutputDto>())
  const loaded = ref(false)

  const isAuthenticated = computed(() => !!currentUser.value)
  const hasAdminAccess = computed(() => !!(currentUser.value?.role?.label && RolesAdmins.includes(currentUser.value?.role?.label)))
  const canManageRoles = computed(() => hasAdminAccess)
  // const canManageRoles = computed(() => !!currentUser.value?.roles?.find(role => role.name === RoleName.ADMIN || role?.permissions?.find(permission => permission?.name === 'CREATE_ROLE')))
  // TODO: A revoir pour les droit de démarches
  const canAccessDemarches = computed(() => !!(currentUser.value?.role?.label))
  // const canAccessDemarches = computed(() => !!currentUser.value?.roles?.find(role => role.name === RoleName.ADMIN || role?.permissions?.find(permission => permission?.name === 'ACCESS_DEMARCHE')))

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

  const getUsersRole = async (dto: PaginationDto<IUser>): Promise<PaginatedDto<UserOutputDto>> => {
    return bnApiClient.getRolesUsers(dto)
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
    getUsersRole,
    resetUser,
  }
})
