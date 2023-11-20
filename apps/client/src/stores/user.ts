import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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
  const selectedEditableUserLoading = ref(false)
  const currentUser = ref<UserOutputDto | null>(null)
  const myProfile = ref<MyProfileOutputDto | null>(null)
  const users = ref<Map<number, UserOutputDto>>(new Map<number, UserOutputDto>())
  const selectedEditableUser = ref<UserWithEditableRole | null>(null)
  const keySelectUser = ref<string>(getRandomId('selectedUser-selected'))
  const loaded = ref(false)

  const isAuthenticated = computed(() => !!currentUser.value)
  const hasAdminAccess = computed(() => !!(currentUser.value?.role?.label && RolesAdmins.includes(currentUser.value?.role?.label)))
  const canManageRoles = computed(() => hasAdminAccess.value)
  const canAccessDemarches = computed(() => !!(currentUser.value?.role?.label))

  const login = async (loginForm: CredentialsInputDto) => {
    currentUser.value = await bnApiClient.loginUser(loginForm)
  }

  const forceResetUser = () => {
    currentUser.value = null
  }

  const logout = async () => {
    await bnApiClient.logoutUser()
    forceResetUser()
  }

  const loadMyProfile = async () => {
    myProfile.value = await bnApiClient.fetchMyProfile()
    currentUser.value = myProfile.value
    loaded.value = true
  }

  const listUsers = async (dto: PaginationUserDto) => {
    if (!hasAdminAccess.value) return
    return bnApiClient.listUsers(dto)
  }

  const loadUserById = async (id: number) => {
    selectedEditableUserLoading.value = true
    if (!hasAdminAccess.value) return
    selectedEditableUser.value = await bnApiClient.getUserRoleById(id)
    keySelectUser.value = getRandomId('selectedUser-selected')
    selectedEditableUserLoading.value = false
    return selectedEditableUser.value
  }

  const updateRole = async (role: RolesKeys) => {
    selectedEditableUserLoading.value = true
    const id = selectedEditableUser.value?.originalUser.id
    if (!id) throw new Error('L\'Utilisateur n\'a pas été selectionné.')
    await bnApiClient.updateUserRole(id, role)
    await loadUserById(id)
  }

  const updateUserOneRoleOption = async (demarchesRoles: UpdateOneRoleOptionDto, reloadUser: boolean): Promise<void> => {
    selectedEditableUserLoading.value = true
    const id = selectedEditableUser.value?.originalUser.id
    if (!id) throw new Error('L\'Utilisateur n\'a pas été selectionné.')
    await bnApiClient.updateUserDemarchesRole(id, demarchesRoles)
    if (reloadUser) {
      await loadUserById(id)
    }
  }

  const removeRole = async () => {
    selectedEditableUserLoading.value = true
    const id = selectedEditableUser.value?.originalUser.id
    if (!id) throw new Error('L\'Utilisateur n\'a pas été selectionné.')
    await bnApiClient.removeRole(id)
    await loadUserById(id)
  }
  return {
    currentUser,
    myProfile,
    users,
    selectedEditableUser,
    loaded,
    isAuthenticated,
    hasAdminAccess,
    canManageRoles,
    canAccessDemarches,
    keySelectUser,
    selectedEditableUserLoading,
    login,
    logout,
    loadMyProfile,
    listUsers,
    loadUserById,
    updateRole,
    updateUserOneRoleOption,
    removeRole,
    forceResetUser,
  }
})
