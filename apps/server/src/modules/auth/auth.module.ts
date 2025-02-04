import { Module } from '@nestjs/common'
import { AuthService } from './providers/auth.service'
import { UserModule } from '../users/user.module'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from './controllers/auth.controller'
import { LocalStrategy } from '@/modules/auth/providers/local.strategy'
import { SessionSerializer } from '@/modules/auth/objects/session.serializer'
import { ConfigService } from '@nestjs/config'

@Module({
  imports: [
    UserModule,
    PassportModule.register({ session: true }),
  ],
  providers: [AuthService, LocalStrategy, SessionSerializer, ConfigService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
