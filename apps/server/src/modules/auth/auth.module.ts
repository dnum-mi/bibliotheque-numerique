import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./local.strategy";
import { JwtModule } from "@nestjs/jwt";
import { jwtConstants } from "./constants";
import { JwtStrategy } from "./jwt.strategy";
import { AuthController } from "./auth.controller";
import { SessionSerializer } from "./session.serializer";

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
