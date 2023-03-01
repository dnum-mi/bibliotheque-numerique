import type { TPermission } from '@/types/tpermission'

export interface IRole {
  id: number;
  name: string;
  description: string;
  permissions: TPermission[]
  createdAt: string;
  updatedAt: string;
}

export interface IRoleForm {
  id?: number;
  name: string;
  description?: string;
  permissions?: TPermission[]
}
