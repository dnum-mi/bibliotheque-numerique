// Note: This line does represent only "special" roles, not all roles.
export enum RoleName {
  // eslint-disable-next-line
  ADMIN = 'admin',
}

export enum PermissionName {
  // eslint-disable-next-line
  CREATE_ROLE = 'CREATE_ROLE',
  // eslint-disable-next-line
  ACCESS_DEMARCHE = 'ACCESS_DEMARCHE',
}

export type TOptionTypes = {
  type: 'string' | 'number' | 'boolean';
  multiple?: boolean;
}

export type TPermission = {
  name: string;
  optionsTypes?: Record<string, TOptionTypes>;
  options?: any;
};

export const Permissions: Record<string, TPermission> = {
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
