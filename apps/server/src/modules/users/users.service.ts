import { Injectable } from "@nestjs/common";
import { User } from "./entities/user.entity";
import { FindOneOptions, Repository } from "typeorm";
import { BaseEntityService } from "../../shared/base-entity/base-entity.service";
import { LoggerService } from "../../shared/modules/logger/logger.service";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UsersService extends BaseEntityService<User> {
  constructor(
    protected logger: LoggerService,
    @InjectRepository(User) protected readonly repo: Repository<User>,
  ) {
    super(repo, logger);
    this.logger.setContext(this.constructor.name);
  }

  async findByEmail(
    email: string,
    select?: FindOneOptions<User>["select"],
  ): Promise<User | undefined> {
    this.logger.verbose("findByEmail");
    return this.repo.findOne({
      where: { email },
      relations: { roles: true },
      select,
    });
  }

  async create(email: string, password): Promise<User> {
    this.logger.verbose("create");
    const userInDb = await this.findByEmail(email);
    if (userInDb) {
      throw new Error("User already exists");
    }
    return this.repo.create({
      email,
      password,
    });
  }

  async findOrCreate(email: string, password): Promise<User> {
    this.logger.verbose("findOrCreate");
    const userInDb = await this.findByEmail(email);
    if (userInDb) {
      return userInDb;
    }
    return this.repo.create({
      email,
      password,
    });
  }

  async listUsers(): Promise<User[]> {
    this.logger.verbose("listUsers");
    return await this.repo.find({ relations: ["roles"] });
  }

  async getUserById(id: number): Promise<User> {
    this.logger.verbose("getUserById");
    return this.findOneById(id, { roles: true });
  }
}
