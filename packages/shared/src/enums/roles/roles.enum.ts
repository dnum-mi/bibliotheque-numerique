export const Roles = {
  sudo: 'sudo',
  superadmin: 'superadmin',
  admin: 'admin',
  instructor: 'instructor',
}

export type RolesKeys = (typeof Roles)[keyof typeof Roles]

export const RoleHierarchy: { [key in RolesKeys]: number } = {
  sudo: 0,
  superadmin: 1,
  admin: 2,
  instructor: 3,
  any: 10,
  undefined: 11,
}
