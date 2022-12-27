import { Injectable } from "@nestjs/common";
import { User } from "../entities";

@Injectable()
export class UsersService {
  async findByEmail(email: string): Promise<User | undefined> {
    return User.findOne({ where: { email }, relations: { roles: true } });
  }

  async create(email: string, password): Promise<User> {
    const userInDb = await this.findByEmail(email);
    if (userInDb) {
      throw new Error("User already exists");
    }

    const user = new User();
    user.email = email;
    user.password = password;
    await user.save();
    return user;
  }

  async findOrCreate(email: string, password): Promise<User> {
    const userInDb = await this.findByEmail(email);
    if (userInDb) {
      return userInDb;
    }
    const user = new User();
    user.email = email;
    user.password = password;
    await user.save();
    return user;
  }
}
