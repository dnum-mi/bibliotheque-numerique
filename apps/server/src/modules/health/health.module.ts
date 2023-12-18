import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'
import { HealthController } from './controllers/health.controller'
import { VersionHealthIndicator } from './providers/version-health.indicator'
import { EnvironmentHealthIndicator } from './providers/environment-health.indicator'

@Module({
  imports: [TerminusModule],
  providers: [VersionHealthIndicator, EnvironmentHealthIndicator],
  controllers: [HealthController],
})
export class HealthModule {}
