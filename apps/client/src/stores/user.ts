import { getRandomId } from '@gouvminint/vue-dsfr'

import bnApiClient from '@/api/api-client'
import {
  type ICredentialsInput,
  type IUserOutput,
  type IPaginationUser,
  type IMyProfileOutput,
  type IUserWithEditableRole,
  type IUpdateOneRoleOption,
  type IUpdateProfile,
  type RolesKeys,
  Roles,
} from '@biblio-num/shared'

const SuperAdminRoles = [Roles.superadmin, Roles.sudo]

const AdminRoles = [...SuperAdminRoles, Roles.admin]

export const useUserStore = defineStore('user', () => {
  const $reset = () => {
    selectedEditableUserLoading.value = false
    currentUser.value = null
    myProfile.value = null
    users.value = new Map<number, IUserOutput>()
    selectedEditableUser.value = null
    keySelectUser.value = getRandomId('selectedUser-selected')
  }

  const selectedEditableUserLoading = ref(false)
  const currentUser = ref<IUserOutput | null>(null)
  const myProfile = ref<IMyProfileOutput | null>(null)
  const users = ref<Map<number, IUserOutput>>(new Map<number, IUserOutput>())
  const selectedEditableUser = ref<IUserWithEditableRole | null>(null)
  const keySelectUser = ref<string>(getRandomId('selectedUser-selected'))
  const isAuthenticated = computed(() => !!currentUser.value)
  const hasAdminAccess = computed(() => !!(currentUser.value?.role?.label && AdminRoles.includes(currentUser.value?.role?.label)))
  const canAccessDemarches = computed(() => !!currentUser.value?.role?.label)

  const login = async (loginForm: ICredentialsInput) => {
    currentUser.value = await bnApiClient.loginUser(loginForm)
  }

  const forceResetUser = () => {
    currentUser.value = null
    $reset()
  }

  const logout = async () => {
    await bnApiClient.logoutUser()
    forceResetUser()
  }

  const loadMyProfile = async () => {
    myProfile.value = await bnApiClient.fetchMyProfile()
    currentUser.value = myProfile.value
    return !!currentUser.value
  }

  const changeMyProfile = async (dto: IUpdateProfile) => {
    await bnApiClient.updateMyProfile(dto)
    await loadMyProfile()
  }

  const listUsers = async (dto: IPaginationUser) => {
    if (!hasAdminAccess.value) {
      return
    }
    return bnApiClient.listUsers(dto)
  }

  const loadUserById = async (id: number) => {
    selectedEditableUserLoading.value = true
    if (!hasAdminAccess.value) {
      return
    }
    selectedEditableUser.value = await bnApiClient.getUserRoleById(id)
    keySelectUser.value = getRandomId('selectedUser-selected')
    selectedEditableUserLoading.value = false
    return selectedEditableUser.value
  }

  const updateRole = async (role: RolesKeys) => {
    selectedEditableUserLoading.value = true
    const id = selectedEditableUser.value?.originalUser.id
    if (!id) {
      throw new Error('L\'Utilisateur n\'a pas été selectionné.')
    }
    await bnApiClient.updateUserRole(id, role)
    await loadUserById(id)
  }

  const updateUserOneRoleOption = async (demarchesRoles: IUpdateOneRoleOption, reloadUser: boolean): Promise<void> => {
    selectedEditableUserLoading.value = true
    const id = selectedEditableUser.value?.originalUser.id
    if (!id) {
      throw new Error('L\'Utilisateur n\'a pas été selectionné.')
    }
    await bnApiClient.updateUserDemarchesRole(id, demarchesRoles)
    if (reloadUser) {
      await loadUserById(id)
    }
  }

  const removeRole = async () => {
    selectedEditableUserLoading.value = true
    const id = selectedEditableUser.value?.originalUser.id
    if (!id) {
      throw new Error('L\'Utilisateur n\'a pas été selectionné.')
    }
    await bnApiClient.removeRole(id)
    await loadUserById(id)
  }

  const CanConfigureDemarche = (demarcheId: number) =>
    SuperAdminRoles.includes(currentUser.value?.role?.label)
    || (currentUser.value?.role?.label === Roles.admin && currentUser.value?.role?.options[demarcheId]?.national)

  return {
    $reset,
    currentUser,
    myProfile,
    users,
    selectedEditableUser,
    isAuthenticated,
    hasAdminAccess,
    CanConfigureDemarche,
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
    changeMyProfile,
  }
})
