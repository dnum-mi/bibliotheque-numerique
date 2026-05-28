import { Module } from '@nestjs/common'
import { RedisDependency } from './infrastructure/dependencies/redis.dependency'
import { DsDependency } from './infrastructure/dependencies/ds.dependency'
import { HubDependency } from './infrastructure/dependencies/hub.dependency'
import { S3Dependency } from './infrastructure/dependencies/s3.dependency'
import { DependencySupervisorService } from './providers/dependency-supervisor.service'
import { HealthController } from '@/modules/health/health.controller'
import { RedisModule } from '@/shared/modules/redis/redis.module'
import { S3Module } from '@/shared/modules/s3/s3.module'
import { HealthService } from './providers/health.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { HealthSnapshot } from '@/modules/health/objects/health-snapshot.entity'
import { DependencyCheckService } from '@/modules/health/providers/depency-check.service'
import { HealthCronService } from './providers/health-cron.service'

@Module({
  imports: [RedisModule, S3Module, TypeOrmModule.forFeature([HealthSnapshot])],
  controllers: [HealthController],
  providers: [
    HealthService,
    RedisDependency,
    DsDependency,
    HubDependency,
    S3Dependency,
    DependencySupervisorService,
    DependencyCheckService,
    HealthCronService,
  ],
  exports: [DependencySupervisorService],
})
export class HealthModule {}
