import {
  Controller,
  Body,
  Get,
  Post,
  HttpException,
  HttpStatus,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { RolesService } from "./roles.service";
import { PermissionName, Role } from "../entities";
import {
  PermissionsGuard,
  RequirePermissions,
} from "../guards/permissions.guard";

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

  @Post("create")
  async addRole(@Body("role") role: Partial<Role>) {
    try {
      return await this.rolesService.updateRole(role);
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
