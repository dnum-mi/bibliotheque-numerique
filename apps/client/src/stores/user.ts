import { defineStore } from 'pinia'
import type { User } from '@/shared/interfaces'
import bnApiClient from '@/api/api-client'
import { RoleName } from '@/shared/types/Permission.type'
import type { CredentialsInputDto, UserOutputDto } from '@biblio-num/shared'
interface UserState {
  currentUser: User | null,
  users: Map<number, User>,
  loaded: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    currentUser: null,
    users: new Map<number, UserOutputDto>(),
    loaded: false,
  }),
  getters: {
    isAuthenticated (state): boolean {
      return !!state.currentUser
    },
    hasAdminAccess (state): boolean {
      return !!(state.currentUser?.roles.some(role => role.name === RoleName.ADMIN))
    },
    canManageRoles (state): boolean {
      return !!state.currentUser?.roles?.find(role => role.name === RoleName.ADMIN || role?.permissions?.find(permission => permission?.name === 'CREATE_ROLE'))
    },
    canAccessDemarches (state): boolean {
      return !!state.currentUser?.roles?.find(role => role.name === RoleName.ADMIN || role?.permissions?.find(permission => permission?.name === 'ACCESS_DEMARCHE'))
    },
  },
  actions: {
    async login (loginForm: CredentialsInputDto) {
      this.currentUser = await bnApiClient.loginUser(loginForm)
    },
    async logout () {
      await bnApiClient.logoutUser()
      this.currentUser = null
    },
    async loadCurrentUser () {
      this.currentUser = await bnApiClient.fetchCurrentUser()
      this.loaded = true
    },
    async loadUsers () {
      if (!this.hasAdminAccess) return
      const users = await bnApiClient.getUsers()
      if (!users) return
      for (const user of users) {
        this.users.set(user.id, user)
      }
    },
    async loadUserById (id: number) {
      if (!this.hasAdminAccess) return
      const user = await bnApiClient.getUserById(id)
      if (!user) return
      this.users.set(user.id, user)
    },
  },
})
