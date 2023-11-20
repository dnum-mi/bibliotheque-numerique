import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import type { CredentialsInputDto, UserOutputDto } from '@biblio-num/shared'

import type { User } from '@/shared/interfaces'
import bnApiClient from '@/api/api-client'
import type {
  CredentialsInputDto,
  UserOutputDto,
  PaginationUserDto,
  MyProfileOutputDto,
  UserWithEditableRole,
  RolesKeys,
  UpdateOneRoleOptionDto,
} from '@biblio-num/shared'
import { getRandomId } from '@gouvminint/vue-dsfr'

// TODO: enum Roles dans packages/shared n'est pas récupérable
const RolesAdmins = ['admin', 'sudo', 'superadmin']

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<UserOutputDto | null>(null)
  const myProfile = ref<MyProfileOutputDto | null>(null)
  const users = ref<Map<number, UserOutputDto>>(new Map<number, UserOutputDto>())
  const selectedUser = ref<UserWithEditableRole | null>(null)
  const keySelectUser = ref<string>(getRandomId('user-selected'))
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

  const loadMyProfile = async () => {
    myProfile.value = await bnApiClient.fetchMyProfile()
    currentUser.value = myProfile.value
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
    selectedUser.value = await bnApiClient.getUserRoleById(id)
    keySelectUser.value = getRandomId('user-selected')
    return selectedUser.value
  }

  const updateRole = async (role: RolesKeys) => {
    const id = selectedUser.value?.originalUser.id
    if (!id) throw new Error("L'Utilisateur n'a pas été selectionné.")
    await bnApiClient.updateUserRole(id, role)
    await loadUserById(id)
  }

  const updateUserDemarchesRole = async (demarchesRoles: UpdateOneRoleOptionDto, reloadUser: boolean) => {
    const id = selectedUser.value?.originalUser.id
    if (!id) throw new Error("L'Utilisateur n'a pas été selectionné.")
    await bnApiClient.updateUserDemarchesRole(id, demarchesRoles)
    if (reloadUser) await loadUserById(id)
  }

  const removeRole = async () => {
    const id = selectedUser.value?.originalUser.id
    if (!id) throw new Error("L'Utilisateur n'a pas été selectionné.")
    await bnApiClient.removeRole(id)
    await loadUserById(id)
  }
  return {
    currentUser,
    myProfile,
    users,
    selectedUser,
    loaded,
    isAuthenticated,
    hasAdminAccess,
    canManageRoles,
    canAccessDemarches,
    keySelectUser,
    login,
    logout,
    loadMyProfile,
    listUsers,
    loadUserById,
    updateRole,
    updateUserDemarchesRole,
    getUsersRole,
    resetUser,
    removeRole,
  }
})
