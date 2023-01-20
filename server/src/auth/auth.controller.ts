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
  async signIn(@Request() req, @Body() body) {
    await this.authService.login(body);
    return req.user;
  }

  @Post("sign_up")
  async signUp(@Body() body) {
    return this.usersService.create(body.email, body.password);
  }

  @Delete("/")
  async logout(@Request() req, @Response() res, next) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }

      res.send({ success: true });
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get("jwt/profile")
  jwtGetProfile(@Request() req) {
    if (req.user) {
      return req.user;
    } else {
      return {};
    }
  }

  @UseGuards(AuthenticatedGuard)
  @Get("profile")
  getProfile(@Request() req) {
    if (req.user) {
      return this.authService.login(req.user);
    } else {
      return {};
    }
  }
}
