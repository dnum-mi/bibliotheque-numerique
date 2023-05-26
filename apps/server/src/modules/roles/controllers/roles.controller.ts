import {
  Controller,
  Body,
  Get,
  Post,
  Put,
  HttpException,
  HttpStatus,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { RolesService } from "../providers/roles.service";

import {
  PermissionsGuard,
  RequirePermissions,
} from "../providers/permissions.guard";
import { PermissionName } from "../../../shared/types/Permission.type";
import { Role } from "../entities/role.entity";

@Controller("roles")
@UseGuards(PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions({ name: PermissionName.CREATE_ROLE })
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async listRoles() {
    let roles: Role[];
    try {
      roles = await this.rolesService.listRoles();
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (roles.length === 0) {
      throw new HttpException("No role found", HttpStatus.NOT_FOUND);
    }
    return roles;
  }

  @Get(":id")
  @RequirePermissions({ name: PermissionName.CREATE_ROLE })
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async getRoleById(@Param("id", ParseIntPipe) id: number) {
    let role: Role;
    try {
      role = await this.rolesService.getRoleById(id);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!role) {
      throw new HttpException("Role not found", HttpStatus.NOT_FOUND);
    }
    return role;
  }

  @Post()
  @RequirePermissions({ name: PermissionName.CREATE_ROLE })
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async create(@Body("role") role: Partial<Role>) {
    try {
      return await this.rolesService.create(role);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(":id")
  @RequirePermissions({ name: PermissionName.CREATE_ROLE })
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body("role") role: Partial<Role>,
  ) {
    try {
      return await this.rolesService.update(id, role);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("assign")
  @RequirePermissions({ name: PermissionName.CREATE_ROLE })
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async assignRoleToUser(
    @Body("userId") userId: number,
    @Body("roleId") roleId: number,
  ) {
    try {
      await this.rolesService.assignRoleToUser(roleId, userId);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("unassign")
  @RequirePermissions({ name: PermissionName.CREATE_ROLE })
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async unassignRoleToUser(
    @Body("userId") userId: number,
    @Body("roleId") roleId: number,
  ) {
    try {
      await this.rolesService.unassignRoleToUser(roleId, userId);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete("remove/:id")
  @RequirePermissions({ name: PermissionName.CREATE_ROLE })
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async deleteRole(@Param("id", ParseIntPipe) id: number) {
    try {
      await this.rolesService.remove(id);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
