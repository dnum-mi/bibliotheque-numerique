import { Module } from '@nestjs/common'
import { UsersController } from './controllers/users.controller'
import { UsersService } from './providers/users.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { JwtModule } from '@nestjs/jwt'
import { SendMailModule } from '../sendmail/sendmail.module'
import { ConfigModule, ConfigService } from '@nestjs/config'

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
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
