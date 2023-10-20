export enum RoleName {
  ADMIN = 'admin',
  ADMIN_LOCAL = 'admin_local',
}

export const Permissions: Record<string, string> = {
  CREATE_ROLE: 'Créer un rôle',
  ACCESS_DEMARCHE: 'Accéder à des démarches',
}

export type TPermission = {
  name: string;
  options?: unknown;
  write?: boolean;
  delete?: boolean;
};
