import { Injectable, Logger } from "@nestjs/common";
import { Role, User } from "../entities";
import { LoggerService } from "../logger/logger.service";

@Injectable()
export class RolesService {
  private readonly logger = new Logger(
    RolesService.name,
  ) as unknown as LoggerService;

  async listRoles() {
    try {
      return await Role.find();
    } catch (error) {
      this.logger.error({
        short_message: "Échec récupération des rôles",
        full_message: error.toString(),
      });
      throw new Error("Unable to retrieve roles");
    }
  }

  async getRoleById(id: number) {
    try {
      return await Role.findOneBy({ id });
    } catch (error) {
      this.logger.error({
        short_message: "Échec récupération du rôle",
        full_message: error.toString(),
      });
      throw new Error(`Unable to retrieve role id: ${id}`);
    }
  }

  async create(role: Partial<Role>) {
    try {
      const upsertRoleResult = await Role.insertRole(role);
      return upsertRoleResult.raw[0];
    } catch (error) {
      this.logger.error({
        short_message: "Échec création du rôle",
        full_message: error.toString(),
      });
      throw new Error("Unable to create role");
    }
  }

  async update(id: number, role: Partial<Role>) {
    try {
      const updateRoleResult = await Role.updateRole(id, role);
      return updateRoleResult.raw[0];
    } catch (error) {
      this.logger.error({
        short_message: "Échec création du rôle",
        full_message: error.toString(),
      });
      throw new Error("Unable to create role");
    }
  }

  async assignRoleToUser(roleId: number, userId: number) {
    let user: User;
    let role: Role;
    try {
      [user, role] = await Promise.all([
        User.findOne({ where: { id: userId }, relations: { roles: true } }),
        Role.findOneBy({ id: roleId }),
      ]);
    } catch (error) {
      this.logger.error({
        short_message: `Échec récupération de l'utilisateur: ${userId} et du role: ${roleId}`,
        full_message: error.toString(),
      });
      throw new Error(`Unable to retrieve user: ${userId} and role: ${roleId}`);
    }

    try {
      if (!user?.roles?.find((role) => role.id === roleId)) {
        user.roles.push(role);
      }
      return await user.save();
    } catch (error) {
      this.logger.error({
        short_message: `Échec de l'attribution du role: ${roleId} à l'utilisateur: ${userId}`,
        full_message: error.toString(),
      });
      throw new Error(`Unable to assign role: ${roleId} to user: ${userId}`);
    }
  }

  async unassignRoleToUser(roleId: number, userId: number) {
    let user: User;
    debugger;
    try {
      user = await User.findOne({
        where: { id: userId },
        relations: { roles: true },
      });
    } catch (error) {
      this.logger.error({
        short_message: `Échec récupération de l'utilisateur: ${userId}`,
        full_message: error.toString(),
      });
      throw new Error(`Unable to retrieve user: ${userId}`);
    }

    try {
      user.roles = user.roles.filter((role) => {
        return role.id !== roleId;
      });
      return await user.save();
    } catch (error) {
      this.logger.error({
        short_message: `Échec de la suppression du role à l'utilisateur: ${userId}`,
        full_message: error.toString(),
      });
      throw new Error(`Unable to unassign role to user: ${userId}`);
    }
  }

  async remove(id: number) {
    let role: Role;
    try {
      role = await Role.findOneBy({ id });
    } catch (error) {
      this.logger.error({
        short_message: `Échec récupération du role id: ${id}`,
        full_message: error.toString(),
      });
      throw new Error(`Unable to retrieve role id: ${id}`);
    }

    if (role) {
      try {
        if (role.name === "admin") throw new Error("Cannot delete admin role");
        return await role.remove();
      } catch (error) {
        this.logger.error({
          short_message: `Échec suppression du role id: ${id}`,
          full_message: error.toString(),
        });
        throw new Error(`Unable to remove role id: ${id}`);
      }
    }
  }
}
