import { Module, Logger } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthService } from './providers/auth.service'
import { AuthController } from './controllers/auth.controller'
import { JwtStrategy } from '@/modules/auth/providers/jwt.strategy'
import { UserModule } from '../users/user.module'
import { JwtAuthGuard } from './providers/jwt-auth.guard'
import { RefreshToken } from '../users/objects/refresh-token.entity'

@Module({
  imports: [
    UserModule,
    PassportModule.register({ session: false }),
    ConfigModule,
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('auth').jwtSecret,
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, Logger],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
