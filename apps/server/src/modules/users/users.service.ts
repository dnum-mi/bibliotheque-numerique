import { Injectable, Logger } from "@nestjs/common";
import { User } from "../../shared/entities";
import { LoggerService } from "../logger/logger.service";
import { FindOneOptions } from "typeorm";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(
    UsersService.name,
  ) as unknown as LoggerService;
  async findByEmail(
    email: string,
    select?: FindOneOptions<User>["select"],
  ): Promise<User | undefined> {
    return User.findOne({
      where: { email },
      relations: { roles: true },
      select,
    });
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

  async listUsers(): Promise<User[]> {
    try {
      return await User.find({ relations: ["roles"] });
    } catch (error) {
      this.logger.error({
        short_message: "Échec récupération des utilisateurs",
        full_message: error.toString(),
      });
      throw new Error("Unable to retrieve users");
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      return await User.findOne({
        where: { id },
        relations: ["roles"],
      });
    } catch (error) {
      this.logger.error({
        short_message: `Échec récupération de l'utilisateur id: ${id}`,
        full_message: error.toString(),
      });
      throw new Error(`Unable to retrieve user ${id}`);
    }
  }
}
