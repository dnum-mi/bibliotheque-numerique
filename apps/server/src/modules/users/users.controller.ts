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
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async signUp(@Body() body: CreateUserDto) {
    return this.usersService.create(body.email, body.password);
  }

  // TODO: Add guards
  @Patch("user/:id")
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async updateMyUser(@Body() body: UpdateUserDto) {
    return this.usersService.create(body.email, body.password);
  }

  @Get()
  @Roles("admin")
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
