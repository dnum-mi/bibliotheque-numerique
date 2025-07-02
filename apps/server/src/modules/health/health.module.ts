import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'
import { HttpModule } from '@nestjs/axios'
import { HealthController } from './controllers/health.controller'
import { VersionHealthIndicator } from './providers/version-health.indicator'
import { EnvironmentHealthIndicator } from './providers/environment-health.indicator'
import { DsHealthIndicator } from '@/modules/health/providers/ds-health.indicator'
import { ConfigService } from 'aws-sdk'
import { HubHealthIndicator } from '@/modules/health/providers/hub-health.indicator'

@Module({
  imports: [
    TerminusModule,
    HttpModule,
  ],
  providers: [
    ConfigService,
    VersionHealthIndicator,
    EnvironmentHealthIndicator,
    DsHealthIndicator,
    HubHealthIndicator,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
