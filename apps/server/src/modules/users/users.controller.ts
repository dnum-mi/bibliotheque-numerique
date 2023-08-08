import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Roles, RolesGuard } from "../roles/providers/roles.guard";
import { UsersService } from "./users.service";
import {
  CreateUserDto,
  UpdateUserPasswordDto,
  ResetPasswordInputDto,
  UserOutputDto,
} from "@biblio-num/shared";
import { UpdatePasswordGuard } from "./update-password.guard";

@ApiTags("Users")
@Controller("users")
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("user")
  async signUp(@Body() body: CreateUserDto): Promise<UserOutputDto> {
    return this.usersService.create(body.email, body.password);
  }

  @Get()
  @Roles("admin")
  async listUsers(): Promise<UserOutputDto[]> {
    return this.usersService.listUsers();
  }

  @Get("/:id")
  @Roles("admin")
  async getUserById(@Param("id") id: number): Promise<UserOutputDto> {
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
