import { defineStore } from 'pinia'
import type { LoginForm, User } from '@/shared/interfaces'
import { fetchCurrentUser, getUsers, getUserById, loginUser, logoutUser } from '@/shared/services/user.service'
import { PermissionName, RoleName } from '@/shared/types/Permission.type'

interface UserState {
  currentUser: User | null,
  users: Map<number, User>,
  loaded: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    currentUser: null,
    users: new Map(),
    loaded: false,
  }),
  getters: {
    isAuthenticated (state): boolean | null {
      if (state.currentUser) {
        return true
      } else if (!state.currentUser && state.loaded) {
        return false
      } else {
        return null
      }
    },
    hasAdminAccess (state): boolean {
      if (state.currentUser?.roles.find(role => role.name === RoleName.ADMIN)) {
        return true
      } else {
        return false
      }
    },
    canManageRoles (state): boolean {
      return !!state.currentUser?.roles?.find(role => role.name === RoleName.ADMIN || role?.permissions?.find(permission => permission?.name === PermissionName.CREATE_ROLE))
    },
    canAccessDemarches (state): boolean {
      return !!state.currentUser?.roles?.find(role => role.name === RoleName.ADMIN || role?.permissions?.find(permission => permission?.name === PermissionName.ACCESS_DEMARCHE))
    },
  },
  actions: {
    async login (loginForm: LoginForm) {
      try {
        this.currentUser = await loginUser(loginForm)
      } catch (e) {
        console.log('Login Error')
        throw e
      }
    },
    async logout () {
      await logoutUser()
      this.currentUser = null
    },
    async loadCurrentUser () {
      this.currentUser = await fetchCurrentUser()
      this.loaded = true
    },
    async loadUsers () {
      if (!this.hasAdminAccess) return
      const users = await getUsers()
      for (const user of users) {
        this.users.set(user.id, user)
      }
    },
    async loadUserById (id: number) {
      if (!this.hasAdminAccess) return
      const user = await getUserById(id)
      this.users.set(user.id, user)
    },
  },
})
