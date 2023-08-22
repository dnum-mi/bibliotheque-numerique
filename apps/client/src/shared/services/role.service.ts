import axios from 'axios'
import type { IRole, IRoleForm } from '@/shared/interfaces'
import { baseApiUrl, headers } from '@/api/api-client'

export const fetchRoles = async () => {
  const config = {
    method: 'get',
    url: `${baseApiUrl}/roles`,
    headers,
  }
  try {
    const response = await axios(config)
    return response.data
  } catch (error) {
    throw await error
  }
}
export const fetchRoleById = async (id: number) => {
  const config = {
    method: 'get',
    url: `${baseApiUrl}/roles/${id}`,
    headers,
  }
  try {
    const response = await axios(config)
    return response.data
  } catch (error) {
    throw await error
  }
}
export const upsertRole = async (role: IRoleForm, id?: number): Promise<IRole> => {
  if (typeof id === 'number') {
    role.id = id
  }
  const config = {
    method: 'post',
    url: `${baseApiUrl}/roles`,
    headers,
    data: { role },
  }
  try {
    const response = await axios(config)
    return response.data
  } catch (error) {
    throw await error
  }
}
export const updateRole = async (id: number, role: Partial<IRoleForm>): Promise<IRole> => {
  const config = {
    method: 'put',
    url: `${baseApiUrl}/roles/${id}`,
    headers,
    data: { role },
  }
  try {
    const response = await axios(config)
    return response.data
  } catch (error) {
    throw await error
  }
}
export const deleteRole = async (id: number): Promise<boolean> => {
  const config = {
    method: 'delete',
    url: `${baseApiUrl}/roles/remove/${id}`,
    headers,
  }
  try {
    await axios(config)
    return true
  } catch (error) {
    console.error(error)
  }
  return false
}
export const assignRole = async (userId: number, roleId: number): Promise<boolean> => {
  const config = {
    method: 'post',
    url: `${baseApiUrl}/roles/assign`,
    headers,
    data: { userId, roleId },
  }
  try {
    await axios(config)
    return true
  } catch (error) {
    console.error(error)
  }
  return false
}
export const unassignRole = async (userId: number, roleId: number): Promise<boolean> => {
  const config = {
    method: 'post',
    url: `${baseApiUrl}/roles/unassign`,
    headers,
    data: { userId, roleId },
  }
  try {
    await axios(config)
    return true
  } catch (error) {
    console.error(error)
  }
  return false
}
