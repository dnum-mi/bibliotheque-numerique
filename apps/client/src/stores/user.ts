import { getRandomId } from '@gouvminint/vue-dsfr'

import bnApiClient from '@/api/api-client'
import type {
  ICredentialsInput,
  IUserOutput,
  IPaginationUser,
  IMyProfileOutput,
  IUserWithEditableRole,
  IUpdateOneRoleOption,
  IUpdateProfile,
  RolesKeys,
} from '@biblio-num/shared'

import {
  Roles,
} from '@biblio-num/shared'

const SuperAdminRoles = [Roles.superadmin, Roles.sudo]

const AdminRoles = [...SuperAdminRoles, Roles.admin]

export const useUserStore = defineStore('user', () => {
  const selectedEditableUserLoading = ref(false)
  const currentUser = ref<IUserOutput | null>(null)
  const myProfile = ref<IMyProfileOutput | null>(null)
  const users = ref<Map<number, IUserOutput>>(new Map<number, IUserOutput>())
  const selectedEditableUser = ref<IUserWithEditableRole | null>(null)
  const keySelectUser = ref<string>(getRandomId('selectedUser-selected'))
  const isAuthenticated = computed(() => !!currentUser.value)
  const hasAdminAccess = computed(() => !!(currentUser.value?.role?.label && AdminRoles.includes(currentUser.value?.role?.label)))
  const canAccessDemarches = computed(() => !!currentUser.value?.role?.label)
  const accessToken = ref<string | null>(null)

  const $reset = () => {
    selectedEditableUserLoading.value = false
    currentUser.value = null
    myProfile.value = null
    users.value = new Map<number, IUserOutput>()
    selectedEditableUser.value = null
    keySelectUser.value = getRandomId('selectedUser-selected')
  }

  const login = async (loginForm: ICredentialsInput) => {
    const response = await bnApiClient.loginUser(loginForm)

    if ('accessToken' in response) {
      const { accessToken: token } = response
      accessToken.value = token
    }

    return response.message
  }

  const loginWithVerifyAuth = async (tokenValue: string) => {
    const { accessToken: token } = await bnApiClient.loginWithVerifyAuth(tokenValue)
    accessToken.value = token
  }

  const loginWithProconnect = async (code: string, state: string, iss: string) => {
    const { accessToken: token } = await bnApiClient.proConnectCallback(code, state, iss)
    accessToken.value = token
  }

  const forceResetUser = () => {
    currentUser.value = null
    $reset()
  }

  const refreshTokens = async () => {
    const { accessToken: token } = await bnApiClient.refreshTokens()
    accessToken.value = token
  }

  const logout = async () => {
    forceResetUser()
    await bnApiClient.logoutUser()
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

  const updateUserRolesOption = async (demarchesRoles: IUpdateOneRoleOption[], reloadUser: boolean): Promise<void> => {
    selectedEditableUserLoading.value = true
    const id = selectedEditableUser.value?.originalUser.id
    if (!id) {
      throw new Error('L\'Utilisateur n\'a pas été selectionné.')
    }
    await bnApiClient.updateUserDemarchesRoles(id, demarchesRoles)
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
    accessToken,
    hasAdminAccess,
    CanConfigureDemarche,
    canAccessDemarches,
    keySelectUser,
    selectedEditableUserLoading,
    login,
    loginWithVerifyAuth,
    loginWithProconnect,
    logout,
    loadMyProfile,
    listUsers,
    loadUserById,
    updateRole,
    updateUserOneRoleOption,
    removeRole,
    forceResetUser,
    changeMyProfile,
    updateUserRolesOption,
    refreshTokens,
  }
})
