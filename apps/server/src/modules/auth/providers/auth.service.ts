import { Injectable } from "@nestjs/common";
import { UsersService } from "../../users/users.service";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { User } from "../../users/entities/user.entity";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<User | undefined> {
    const user = await this.usersService.findByEmail(email, [
      "id",
      "email",
      "password",
      "roles",
    ]);

    if (!user) {
      throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    return user;
  }
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async login(user) {
    const payload = { email: user.email, sub: user.userId };
    return {
      email: user.email,
      roles: user.roles,
      access_token: this.jwtService.sign(payload),
    };
  }
}
