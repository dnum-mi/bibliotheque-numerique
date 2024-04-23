import { Module } from '@nestjs/common'
import { UserController } from './controllers/user.controller'
import { UserService } from './providers/user.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@/modules/users/objects/user.entity'
import { JwtModule } from '@nestjs/jwt'
import { SendMailModule } from '../sendmail/sendmail.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { DemarcheModule } from '@/modules/demarches/demarche.module'
import { RoleService } from '@/modules/users/providers/role.service'
import { UserRoleController } from '@/modules/users/controllers/user-role.controller'
import { UserMeController } from '@/modules/users/controllers/user-me.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const { secret, expiresIn } = configService.get('jwt')
        return {
          secret,
          signOptions: {
            expiresIn,
          },
        }
      },
      inject: [ConfigService],
    }),
    SendMailModule,
    DemarcheModule,
  ],
  controllers: [UserController, UserMeController, UserRoleController],
  providers: [UserService, RoleService],
  exports: [UserService],
})
export class UserModule {}
