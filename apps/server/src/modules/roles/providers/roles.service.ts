import { Injectable } from "@nestjs/common";
import { LoggerService } from "../../../shared/modules/logger/logger.service";
import { Role } from "../entities/role.entity";
import { User } from "../../users/entities/user.entity";
import { BaseEntityService } from "../../../shared/base-entity/base-entity.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UsersService } from "../../users/users.service";

@Injectable()
export class RolesService extends BaseEntityService<Role> {
  constructor(
    protected readonly logger: LoggerService,
    @InjectRepository(Role) protected readonly repo: Repository<Role>,
    private readonly userService: UsersService,
  ) {
    super(repo, logger);
    this.logger.setContext(this.constructor.name);
  }

  async listRoles(): Promise<Role[]> {
    this.logger.verbose("listRoles");
    return this.findAll();
  }

  async getRoleById(id: number): Promise<Role> {
    this.logger.verbose("getRoleById");
    return this.findOneById(id);
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async create(role: Partial<Role>) {
    this.logger.verbose("create");
    const upsertRoleResult = await this.repo
      .createQueryBuilder()
      .insert()
      .into(Role)
      .values(role)
      .returning(["id", "name", "description", "permissions"])
      .execute();
    return upsertRoleResult.raw[0];
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async update(id: number, role: Partial<Role>) {
    this.logger.verbose("update");
    const updateRoleResult = await this.repo
      .createQueryBuilder()
      .insert()
      .update(Role)
      .set(role)
      .where("id = :id", { id })
      .returning(["id", "name", "description", "permissions"])
      .execute();
    return updateRoleResult.raw[0];
  }

  async assignRoleToUser(roleId: number, userId: number): Promise<User> {
    this.logger.verbose("assignRoleToUser");
    const [user, role] = await Promise.all([
      this.userService.findOneById(userId, { roles: true }),
      this.findOneById(roleId),
    ]);

    if (!user?.roles?.find((role) => role.id === roleId)) {
      user.roles.push(role);
    }
    //TODO: should call user service and this operation should be done in user service
    return this.userService.repository.save(user);
  }

  async unassignRoleToUser(roleId: number, userId: number): Promise<User> {
    this.logger.verbose("unassignRoleToUser");
    const user = await this.userService.findOneById(userId, { roles: true });

    user.roles = user.roles.filter((role) => {
      return role.id !== roleId;
    });
    return this.userService.repository.save(user);
  }

  async removeButAdmin(id: number): Promise<Role | void> {
    this.logger.verbose("removeButAdmin");
    const role = await this.findOneById(id);
    if (role) {
      if (role.name === "admin") throw new Error("Cannot delete admin role");
      return this.repo.remove(role);
    } else {
      this.logger.warn("No Role found. Cannot perform remove.");
    }
  }
}
