import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { IRole, IRoleForm } from '@/shared/interfaces'
import apiClient from '@/api/api-client'

export const useRoleStore = defineStore('role', () => {
  const roles = ref<Map<number, IRole>>(new Map())

  const fetchRoles = async () => {
    const newMap = new Map()
    for (const role of await apiClient.getRoles()) {
      newMap.set(role.id, role)
    }
    roles.value = newMap
  }
  const fetchRoleById = async (id: number) => {
    roles.value.set(id, await apiClient.getRoleById(id))
  }
  const createRole = async (role: IRoleForm) => {
    const newRole: IRole = await apiClient.upsertRole(role)
    roles.value.set(newRole.id, newRole)
  }
  const updateRole = async (id: number, role: Partial<IRoleForm>) => {
    const updatedRole: IRole = await apiClient.updateRole(id, role)
    roles.value.set(id, updatedRole)
  }
  const deleteRole = async (id: number) => {
    if (await apiClient.deleteRole(id)) {
      roles.value.delete(id)
    }
  }
  const assignRole = async (userId: number, roleId: number) => {
    await apiClient.assignRole(userId, roleId)
  }
  const unassignRole = async (userId: number, roleId: number) => {
    await apiClient.unassignRole(userId, roleId)
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
