import { faker } from "@faker-js/faker/locale/fr";
import { PermissionName, Role } from "..";

export function role_test(): Partial<Role> {
  return {
    name: faker.internet.domainName(),
    description: faker.datatype.string(5),
    permissions: [{ name: PermissionName.CREATE_ROLE }],
  };
}
export const createOneRole = async (data) => {
  const role = Role.create();
  for (const entry in data) {
    role[entry] = data[entry];
  }
  return await role.save();
};
