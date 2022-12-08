import {
  Controller,
  Get,
  Request,
  Post,
  UseGuards,
  Body,
} from "@nestjs/common";
import { AppService } from "./app.service";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "./users/users.service";
import { LocalAuthGuard } from "./auth/local-auth.guard";
import { AuthService } from "./auth/auth.service";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService,
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(LocalAuthGuard)
  @Post("auth/sign_in")
  async sign_in(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post("auth/sign_up")
  async sign_up(@Body() body) {
    return this.usersService.create(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Request() req) {
    return req.user;
  }
}
