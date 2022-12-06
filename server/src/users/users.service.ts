import { Injectable } from "@nestjs/common";
import { User } from "../entities";

@Injectable()
export class UsersService {
  async findOne(email: string): Promise<User | undefined> {
    return User.findOneBy({ email: email });
  }

  async create(email: string, password): Promise<User> {
    const userInDb = await this.findOne(email);
    if (userInDb) {
      throw new Error("User already exists");
    }

    const user = new User();
    user.email = email;
    user.password = password;
    await user.save();
    return user;
  }
}
