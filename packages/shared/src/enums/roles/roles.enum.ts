export const Roles = {
  sudo: 'sudo',
  superadmin: 'superadmin',
  admin: 'admin',
  instructor: 'instructor',
}

export type RolesKeys = (typeof Roles)[keyof typeof Roles]
