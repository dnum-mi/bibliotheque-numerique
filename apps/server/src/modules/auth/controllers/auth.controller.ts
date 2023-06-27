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
import { ApiTags } from "@nestjs/swagger";
import { CredentialsInputDto, UserOutputDto } from "@biblio-num/shared";
import { AuthService } from "../providers/auth.service";
import { LocalAuthGuard } from "../providers/local-auth.guard";
import { JwtAuthGuard } from "../providers/jwt-auth.guard";
import { AuthenticatedGuard } from "../providers/authenticated.guard";

/* The TODO: of this file must be done after creating what nestjs calls "e2e-tests" */
@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  // TODO: This route should be called 'token', since the resource it creates is a token, a route should not have a verb
  @UseGuards(LocalAuthGuard)
  @Post("sign-in")
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async signIn(
    @Request() req,
    @Body() body: CredentialsInputDto,
  ): Promise<UserOutputDto> {
    await this.authService.login(body);
    return req.user;
  }

  @Delete("/")
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async logout(@Request() req, @Response() res, next) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }

      res.send({ success: true });
    });
  }

  // TODO: Rename this route
  @UseGuards(JwtAuthGuard)
  @Get("jwt/profile")
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  jwtGetProfile(@Request() req) {
    if (req.user) {
      return req.user;
    } else {
      return {}; // TODO: Why not throw an (HTTP) error here?
    }
  }

  // TODO: Move this route to users.controllers and maybe rename it to "/users/me"
  @UseGuards(AuthenticatedGuard)
  @Get("profile")
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  getProfile(@Request() req) {
    if (req.user) {
      return this.authService.login(req.user);
    } else {
      return {}; // TODO: Why not throw an (HTTP) error here?
    }
  }
}
