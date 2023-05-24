import { faker } from "@faker-js/faker/locale/fr";
import { User } from "../../../modules/users/entities/user.entity";

export function user_test(): Partial<User> {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
    roles: [],
  };
}
export const createOneUser = async (data) => {
  const user = User.create();
  for (const entry in data) {
    user[entry] = data[entry];
  }
  return await user.save();
};
