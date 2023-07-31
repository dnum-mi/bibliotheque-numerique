import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Roles, RolesGuard } from "../roles/providers/roles.guard";
import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";
import {
  CreateUserDto,
  UpdateUserPasswordDto,
  ResetPasswordInputDto,
} from "@biblio-num/shared";
import { UpdatePasswordGuard } from "./update-password.guard";

@ApiTags("Users")
@Controller("users")
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("user")
  async signUp(@Body() body: CreateUserDto): Promise<User> {
    return this.usersService.create(body.email, body.password);
  }

  @Get()
  @Roles("admin")
  async listUsers(): Promise<User[]> {
    return this.usersService.listUsers();
  }

  @Get("/:id")
  @Roles("admin")
  async getUserById(@Param("id") id: number): Promise<User> {
    return this.usersService.getUserById(id);
  }

  @Post("/reset-password")
  async resetPassword(@Body() body: ResetPasswordInputDto): Promise<boolean> {
    await this.usersService.resetPassword(body.email);
    return true;
  }

  @Put("user")
  @UseGuards(UpdatePasswordGuard)
  async updatePassword(
    @Request() req,
    @Body() body: UpdateUserPasswordDto,
  ): Promise<void> {
    await this.usersService.updatePassword(req.user, body.password);
  }
}
