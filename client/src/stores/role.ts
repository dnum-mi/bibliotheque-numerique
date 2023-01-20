import { defineStore } from 'pinia'
import type { IRole, IRoleForm } from '@/shared/interfaces'
import * as roleService from '@/shared/services/role.service'
import { ref } from 'vue'

export const useRoleStore = defineStore('role', () => {
  const roles = ref<IRole[]>([])
  const getRoles = async () => {
    roles.value = await roleService.getRoles()
  }
  const createRole = async (role: IRoleForm) => {
    const newRole: IRole = await roleService.createRole(role)
    roles.value.push(newRole)
  }
  const deleteRole = async (id: number) => {
    if (await roleService.deleteRole(id)) {
      roles.value = roles.value.filter(role => role.id !== id)
    }
  }
  const assignRole = async (userId: number, roleId: number) => {
    await roleService.assignRole(userId, roleId)
  }
  const unassignRole = async (userId: number, roleId: number) => {
    await roleService.unassignRole(userId, roleId)
  }

  return {
    roles,
    getRoles,
    createRole,
    deleteRole,
    assignRole,
    unassignRole,
  }
})
