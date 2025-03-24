import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'
import { RefreshToken } from './refresh-token.entity'
import { RefreshTokenService } from './refreshToken.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
  ],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule { }
