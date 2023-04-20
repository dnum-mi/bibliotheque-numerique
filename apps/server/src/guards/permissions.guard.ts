import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
  Inject,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role, User } from "../entities";
import { TConfig } from "../config/configuration";
import { ConfigService } from "@nestjs/config";
import { TPermission } from "../types/Permission.type";

export const RequirePermissions = (permission?: TPermission) =>
  SetMetadata("permission", permission);

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(ConfigService) private configService: ConfigService,
  ) {}

  private _checkPermission(role: Role, permission: TPermission): boolean {
    return !!role.permissions?.find((p: TPermission) => {
      if (p.name === permission.name) {
        return !(
          (permission.write && !p.write) ||
          (permission.delete && !p.delete)
        );
      }
    });
  }

  private _checkAdmin(user: User): boolean {
    const adminRoleName = this.configService.get<
      TConfig["defaultAdmin"]["roleName"]
    >("defaultAdmin.roleName");
    return !!user.roles?.find((role) => adminRoleName === role.name);
  }

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.get<TPermission>(
      "permission",
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    if (!user) return false;
    if (this._checkAdmin(user)) {
      return true;
    }
    if (!permission) {
      return false;
    }
    return (
      !!user.roles?.find((role) => this._checkPermission(role, permission)) ||
      false
    );
  }
}
