import { defineStore } from 'pinia'
import type { IRole, IRoleForm } from '@/shared/interfaces'
import * as roleService from '@/shared/services/role.service'
import { ref } from 'vue'

export const useRoleStore = defineStore('role', () => {
  const roles = ref<Map<number, IRole>>(new Map())

  const fetchRoles = async () => {
    for (const role of await roleService.fetchRoles()) {
      roles.value.set(role.id, role)
    }
  }
  const fetchRoleById = async (id: number) => {
    roles.value.set(id, await roleService.fetchRoleById(id))
  }
  const createRole = async (role: IRoleForm) => {
    const newRole: IRole = await roleService.upsertRole(role)
    roles.value.set(newRole.id, newRole)
  }
  const updateRole = async (id: number, role: Partial<IRoleForm>) => {
    const updatedRole: IRole = await roleService.updateRole(id, role)
    roles.value.set(id, updatedRole)
  }
  const deleteRole = async (id: number) => {
    if (await roleService.deleteRole(id)) {
      roles.value.delete(id)
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
    fetchRoles,
    fetchRoleById,
    createRole,
    updateRole,
    deleteRole,
    assignRole,
    unassignRole,
  }
})
