import { Controller, Get, Request, Post, UseGuards } from "@nestjs/common";
import { AppService } from "./app.service";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService,
  ) {}

  @Get("protected")
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(AuthGuard("local"))
  @Post("auth/login")
  async login(@Request() req) {
    return req.user;
  }
}
