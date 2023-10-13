import { Module } from '@nestjs/common'
import { AuthService } from './providers/auth.service'
import { UsersModule } from '../users/users.module'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from './controllers/auth.controller'
import { LocalStrategy } from '@/modules/auth/providers/local.strategy'
import { SessionSerializer } from '@/modules/auth/objects/session.serializer'

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ session: true }),
  ],
  providers: [AuthService, LocalStrategy, SessionSerializer],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
