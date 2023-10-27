import { forwardRef, Module } from '@nestjs/common'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { JwtModule } from '@nestjs/jwt'
import { SendMailModule } from '../sendmail/sendmail.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RolesModule } from '@/modules/roles/roles.module'

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
    forwardRef(() => RolesModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
