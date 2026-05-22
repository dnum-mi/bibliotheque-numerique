import { Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import {
  DependencyChecker,
} from '../dependency.types'
import { S3Service } from '@/shared/modules/s3/s3.service'
import { iDependencyCheckResult } from '@biblio-num/shared'

@Injectable()
export class S3Dependency implements DependencyChecker {
  readonly name = 's3' as const

  constructor(
    private readonly s3Service: S3Service,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  async check(): Promise<iDependencyCheckResult> {
    try {
      const s3 = this.s3Service.s3
      const bucket = this.s3Service.bucketName

      if (!s3 || !bucket) {
        return {
          name: this.name,
          status: 'down',
          message: 'S3 client not initialized',
        }
      }

      await this.s3Service.checkBucketAccess()

      return {
        name: this.name,
        status: 'up',
        details: {
          bucket,
        },
      }
    } catch (error) {
      this.logger.debug(error)
      this.logger.warn(`S3 dependency error: ${error?.code}`)

      return {
        name: this.name,
        status: 'down',
        message: error.message,
      }
    }
  }
}
