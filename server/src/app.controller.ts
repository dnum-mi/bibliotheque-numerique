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
import { AuthGuard } from "@nestjs/passport";
import { UsersService } from "./users/users.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(AuthGuard("local"))
  @Post("auth/sign_in")
  async sign_in(@Request() req) {
    return req.user;
  }

  @Post("auth/sign_up")
  async sign_up(@Body() body) {
    return this.usersService.create(body.email, body.password);
  }
}
