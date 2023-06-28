import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Roles, RolesGuard } from "../roles/providers/roles.guard";
import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";
import { CreateUserDto, UpdateUserDto } from "@biblio-num/shared";

@ApiTags("Users")
@Controller("users")
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("user")
  async signUp(@Body() body: CreateUserDto): Promise<User> {
    return this.usersService.create(body.email, body.password);
  }

  // TODO: Add guards
  @Patch("user/:id")
  async updateMyUser(@Body() body: UpdateUserDto): Promise<User> {
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
}
