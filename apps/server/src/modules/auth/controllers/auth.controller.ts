import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Request,
  Response,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CredentialsInputDto, UserOutputDto } from "@biblio-num/shared";
import { AuthService } from "../providers/auth.service";
import { LocalAuthGuard } from "../providers/local-auth.guard";
import { AuthenticatedGuard } from "../providers/authenticated.guard";

/* The TODO: of this file must be done after creating what nestjs calls "tests" */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor (private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('sign-in')
  async signIn (@Request() req, @Body() body: CredentialsInputDto): Promise<UserOutputDto> {
    return this.authService.login(body)
  }

  @Delete('/')
  async logout (@Request() req, @Response() res, next): Promise<void> {
    req.logout(function (err) {
      if (err) {
        return next(err)
      }

      res.send({ success: true })
    })
  }

  @UseGuards(AuthenticatedGuard)
  @Get("profile")
  getProfile(@Request() req): Promise<UserOutputDto> {
    if (req.user) {
      return this.authService.login(req.user)
    } else {
      throw new NotFoundException("User not found");
    }
  }
}
