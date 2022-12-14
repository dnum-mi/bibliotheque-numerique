import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Request,
  Response,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./local-auth.guard";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { AuthenticatedGuard } from "./authenticated.guard";

@Controller("auth")
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post("sign_in")
  async sign_in(@Body() body) {
    return this.authService.login(body);
  }

  @Post("sign_up")
  async sign_up(@Body() body) {
    return this.usersService.create(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get("jwt/profile")
  jwtGetProfile(@Request() req) {
    console.log(req.user);
    if (req.user) {
      return req.user;
    } else {
      return {};
    }
  }

  @UseGuards(AuthenticatedGuard)
  @Get("profile")
  getProfile(@Request() req) {
    console.log(req.user);
    if (req.user) {
      return req.user;
    } else {
      return {};
    }
  }
}
