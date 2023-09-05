import {
  Controller,
  Body,
  Get,
  Post,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { RolesService } from '../providers/roles.service'

import { PermissionsGuard, RequirePermissions } from '../providers/permissions.guard'
import { PermissionName } from '../../../shared/types/Permission.type'
import { Role } from '../entities/role.entity'

@ApiTags('Roles')
@Controller('roles')
@UseGuards(PermissionsGuard)
export class RolesController {
  constructor (private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions({ name: PermissionName.CREATE_ROLE })
  async listRoles (): Promise<Role[]> {
    const roles = await this.rolesService.listRoles()
    if (roles.length === 0) {
      throw new NotFoundException('No role found')
    }
    return roles
  }

  @Get(':id')
  @RequirePermissions({ name: PermissionName.CREATE_ROLE })
  async getRoleById (@Param('id', ParseIntPipe) id: number): Promise<Role> {
    const role = await this.rolesService.getRoleById(id)
    if (!role) {
      throw new NotFoundException('Role not found')
    }
    return role
  }

  @Post()
  @RequirePermissions({ name: PermissionName.CREATE_ROLE })
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async create (@Body('role') role: Partial<Role>) {
    return await this.rolesService.create(role)
  }

  @Put(':id')
  @RequirePermissions({ name: PermissionName.CREATE_ROLE })
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async update (@Param('id', ParseIntPipe) id: number, @Body('role') role: Partial<Role>) {
    return await this.rolesService.update(id, role)
  }

  @Post('assign')
  @RequirePermissions({ name: PermissionName.CREATE_ROLE })
  async assignRoleToUser (@Body('userId') userId: number, @Body('roleId') roleId: number): Promise<void> {
    await this.rolesService.assignRoleToUser(roleId, userId)
  }

  @Post('unassign')
  @RequirePermissions({ name: PermissionName.CREATE_ROLE })
  async unassignRoleToUser (@Body('userId') userId: number, @Body('roleId') roleId: number): Promise<void> {
    await this.rolesService.unassignRoleToUser(roleId, userId)
  }

  @Delete(':id')
  @RequirePermissions({ name: PermissionName.CREATE_ROLE })
  async deleteRole (@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.rolesService.removeButAdmin(id)
  }
}
