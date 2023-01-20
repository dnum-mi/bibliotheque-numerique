import axios from 'axios'
import type { IRole, IRoleForm } from '@/shared/interfaces'
import { baseApiUrl, headers } from '@/utils/api-client'

export const getRoles = async () => {
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
export const createRole = async (role: IRoleForm): Promise<IRole> => {
  const config = {
    method: 'post',
    url: `${baseApiUrl}/roles/create`,
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
