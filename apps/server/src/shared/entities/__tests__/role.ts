import { faker } from "@faker-js/faker/locale/fr";
import { PermissionName } from "../../types/Permission.type";
import { Role } from "../../../modules/roles/entities/role.entity";

export function role_test(): Partial<Role> {
  return {
    name: faker.internet.domainName(),
    description: faker.datatype.string(5),
    permissions: [{ name: PermissionName.CREATE_ROLE }],
  };
}
// TODO: fixe type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createOneRole = async (data) => {
  const role = Role.create();
  for (const entry in data) {
    role[entry] = data[entry];
  }
  return await role.save();
};
