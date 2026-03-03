import { DynamicModule, Module } from '@nestjs/common'
import { RedisDependency } from './infrastructure/dependencies/redis.dependency'
import { DsDependency } from './infrastructure/dependencies/ds.dependency'
import { HubDependency } from './infrastructure/dependencies/hub.dependency'
import { S3Dependency } from './infrastructure/dependencies/s3.dependency'
import { DependencySupervisorService } from './infrastructure/dependency-supervisor.service'
import { HealthController } from '@/modules/health/health.controller'
import { RedisModule } from '@/shared/modules/redis/redis.module'
import { S3Module } from '@/shared/modules/s3/s3.module'
import { DependencyPolicy } from '@/modules/health/infrastructure/dependency.types'
import { HEALTH_DEPENDENCY_POLICY } from '@/modules/health/infrastructure/dependency.symbols'

@Module({})
export class HealthModule {
  static register(policy: DependencyPolicy): DynamicModule {
    return {
      module: HealthModule,
      imports: [
        RedisModule,
        S3Module,
      ],
      controllers: [HealthController],
      providers: [
        RedisDependency,
        DsDependency,
        HubDependency,
        S3Dependency,
        DependencySupervisorService,
        {
          provide: HEALTH_DEPENDENCY_POLICY,
          useValue: policy,
        },
      ],
      exports: [
        DependencySupervisorService,
      ],
    }
  }
}
