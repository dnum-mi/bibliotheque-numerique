export interface IRole {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface IRoleForm {
  name: string;
  description: string;
}
