import { Module } from '@nestjs/common'
import { AuthService } from './providers/auth.service'
import { UserModule } from '../users/user.module'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from './controllers/auth.controller'
import { LocalStrategy } from '@/modules/auth/providers/local.strategy'
import { SessionSerializer } from '@/modules/auth/objects/session.serializer'

@Module({
  imports: [
    UserModule,
    PassportModule.register({ session: true }),
  ],
  providers: [AuthService, LocalStrategy, SessionSerializer],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
