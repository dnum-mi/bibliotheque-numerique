/* eslint-disable no-unused-vars */
// Note: This line does represent only "special" roles, not all roles.
export enum RoleName {
  ADMIN = 'admin',
}

export enum PermissionName {
  CREATE_ROLE = 'CREATE_ROLE',
  ACCESS_DEMARCHE = 'ACCESS_DEMARCHE',
}

export type TOptionTypes = {
  type: 'string' | 'number' | 'boolean';
  multiple?: boolean;
};

type TPermissionBase = {
  name: string;
};

export type TPermissionDescription = TPermissionBase & {
  optionsTypes?: Record<string, TOptionTypes>;
};

export type TPermission = TPermissionBase & {
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
  write?: boolean;
  delete?: boolean;
};

export const Permissions: Record<string, TPermissionDescription> = {
  CREATE_ROLE: {
    name: 'CREATE_ROLE',
  },
  ACCESS_DEMARCHE: {
    name: 'ACCESS_DEMARCHE',
    optionsTypes: {
      demarcheIds: {
        type: 'number',
        multiple: true,
      },
    },
  },
}
