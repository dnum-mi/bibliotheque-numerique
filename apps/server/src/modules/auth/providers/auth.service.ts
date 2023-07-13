import { Injectable, NotFoundException } from "@nestjs/common";
import { UsersService } from "../../users/users.service";
import * as bcrypt from "bcrypt";
import { User } from "../../users/entities/user.entity";
import { LoginOutputDto, RoleOutputDto } from "@biblio-num/shared";

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<User | undefined> {
    const user: User = await this.usersService.findByEmail(email, [
      "id",
      "email",
      "password",
      "roles",
    ]);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const isMatch: boolean = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new NotFoundException("Invalid credentials");
    }

    return user;
  }

  async login(user): Promise<LoginOutputDto> {
    const findUser: User = await this.usersService.findByEmail(user.email, [
      "id",
      "email",
      "roles",
    ]);
    return {
      id: findUser.id,
      email: findUser.email,
      roles: findUser.roles as unknown as RoleOutputDto[],
    };
  }
}
