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
import { RolesService } from "./roles.service";
import { Role } from "../entities";
import {
  PermissionsGuard,
  RequirePermissions,
} from "../guards/permissions.guard";
import { PermissionName } from "../types/permission";
import { PermissionName } from "../types/permissions";

@Controller("roles")
@UseGuards(PermissionsGuard)
@RequirePermissions({ name: PermissionName.CREATE_ROLE })
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
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
