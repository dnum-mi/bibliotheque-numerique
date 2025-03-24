import { Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { RefreshToken } from './refresh-token.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { LessThan, Repository } from 'typeorm'

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly logger: LoggerService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,

  ) {
    this.logger.setContext(this.constructor.name)
  }

  async deleteRefreshTokenExpiered(): Promise<number> {
    const deleteResult = await this.refreshTokenRepository.delete({ expieredAt: LessThan(new Date()) })
    return deleteResult.affected
  }
}
