import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
  Inject,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { User } from "../../shared/entities";
import { ConfigService } from "@nestjs/config";
import { TConfig } from "../../config/configuration";

export const Roles = (...roles: string[]) => SetMetadata("roles", roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @Inject(ConfigService) private configService: ConfigService,
    private reflector: Reflector,
  ) {}
  _findRole(user: User, roleName: string): boolean {
    return !!user.roles?.find((role) => role.name === roleName);
  }

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>("roles", context.getHandler());
    const adminRoleName = this.configService.get<
      TConfig["defaultAdmin"]["roleName"]
    >("defaultAdmin.roleName");
    if (!roles || roles.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    if (!user) return false;
    if (this._findRole(user, adminRoleName)) {
      return true;
    }
    return !!roles.find((role) => this._findRole(user, role)) || false;
  }
}
