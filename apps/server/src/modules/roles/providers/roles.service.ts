import { Injectable } from "@nestjs/common";
import { LoggerService } from "../../../shared/modules/logger/logger.service";
import { Role } from "../entities/role.entity";
import { User } from "../../users/entities/user.entity";

@Injectable()
export class RolesService {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(this.constructor.name);
  }

  async listRoles(): Promise<Role[]> {
    return Role.find();
  }

  async getRoleById(id: number): Promise<Role> {
    return await Role.findOneBy({ id });
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async create(role: Partial<Role>) {
    const upsertRoleResult = await Role.insertRole(role);
    return upsertRoleResult.raw[0];
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async update(id: number, role: Partial<Role>) {
    const updateRoleResult = await Role.updateRole(id, role);
    return updateRoleResult.raw[0];
  }

  async assignRoleToUser(roleId: number, userId: number): Promise<User> {
    const [user, role] = await Promise.all([
      User.findOne({ where: { id: userId }, relations: { roles: true } }),
      Role.findOneBy({ id: roleId }),
    ]);

    if (!user?.roles?.find((role) => role.id === roleId)) {
      user.roles.push(role);
    }
    return await user.save();
  }

  async unassignRoleToUser(roleId: number, userId: number): Promise<User> {
    debugger; // TODO: ???
    const user = await User.findOne({
      where: { id: userId },
      relations: { roles: true },
    });

    user.roles = user.roles.filter((role) => {
      return role.id !== roleId;
    });
    return await user.save();
  }

  async remove(id: number): Promise<Role | void> {
    const role = await Role.findOneBy({ id });
    if (role) {
      if (role.name === "admin") throw new Error("Cannot delete admin role");
      return role.remove();
    } else {
      this.logger.warn("No Role found. Cannot perform remove.");
    }
  }
}
