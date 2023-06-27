import { Module } from "@nestjs/common";
import { AuthService } from "./providers/auth.service";
import { UsersModule } from "../users/users.module";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./providers/local.strategy";
import { JwtModule } from "@nestjs/jwt";
import { jwtConstants } from "./objects/constants";
import { JwtStrategy } from "./providers/jwt.strategy";
import { AuthController } from "./controllers/auth.controller";
import { SessionSerializer } from "./objects/session.serializer";

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ session: true }),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "60s" },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, SessionSerializer],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
