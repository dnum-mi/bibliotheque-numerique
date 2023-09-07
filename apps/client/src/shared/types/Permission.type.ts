export enum RoleName {
  ADMIN = 'admin',
}

export const Permissions: Record<string, string> = {
  CREATE_ROLE: 'Créer un rôle',
  ACCESS_DEMARCHE: 'Accéder à des démarches',
}

export type TPermission = {
  name: string;
  options?: any;
  write?: boolean;
  delete?: boolean;
};
