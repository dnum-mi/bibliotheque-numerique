import type { TPermission } from '@/shared/types/Permission.type'

export interface IRole {
  id: number;
  name: string;
  description: string;
  permissions: TPermission[]
  createAt: string;
  updateAt: string;
}

export interface IRoleForm {
  id?: number;
  name: string;
  description?: string;
  permissions?: TPermission[]
}
