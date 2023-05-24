import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  HttpException,
  HttpStatus,
  Param,
  UseGuards,
} from "@nestjs/common";
import { Roles, RolesGuard } from "../roles/providers/roles.guard";
import { UsersService } from "./users.service";
import { User } from "../../shared/entities";

@Controller("users")
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("user")
  async signUp(@Body() body: CreateUserDto) {
    return this.usersService.create(body.email, body.password);
  }

  // TODO: Add guards
  @Patch("user/:id")
  async updateMyUser(@Body() body: UpdateUserDto) {
    return this.usersService.create(body.email, body.password);
  }

  @Get()
  @Roles("admin")
  async listUsers() {
    let users: User[];
    try {
      users = await this.usersService.listUsers();
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
    return users;
  }

  @Get("/:id")
  @Roles("admin")
  async getUserById(@Param("id") id: number) {
    let user: User;
    try {
      user = await this.usersService.getUserById(id);
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
    return user;
  }
}
