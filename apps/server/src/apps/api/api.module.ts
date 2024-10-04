import { Module } from '@nestjs/common'
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import configuration from '../../config/configuration'
import fileConfig from '../../config/file.config'
import dsConfig from '../../config/ds.config'
import loggerConfig from '../../config/logger.config'
import typeormConfig from '../../config/typeorm-nest.config'
import smtpConfig from '../../config/smtp.config'
import jwtConfig from '../../config/jwt.config'
import rnaConfig from '../../config/rna.config'
import rnfConfig from '../../config/rnf.config'
import sudoUserConfig from '@/config/sudo-user.config'
import instructionTimeMappingConfig from '@/config/instructionTimeMapping.config'
import redisConfig from '@/config/redis.config'
import cronConfig from '@/config/cron.config'
import bullConfig from '@/config/bull.config'

import { DemarcheModule } from '@/modules/demarches/demarche.module'
import { DossierModule } from '@/modules/dossiers/dossier.module'
import { LoggerModule } from '@/shared/modules/logger/logger.module'
import { UserModule } from '@/modules/users/user.module'
import { FileModule } from '@/modules/files/file.module'
import { typeormFactoryLoader } from '@/shared/utils/typeorm-factory-loader'
import { HealthModule } from '@/modules/health/health.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { DsApiModule } from '@/shared/modules/ds-api/ds-api.module'
import { CustomFilterModule } from '@/modules/custom-filters/custom-filter.module'
import { XlsxModule } from '@/shared/modules/xlsx/xlsx.module'
import { OrganismeModule } from '@/modules/organismes/organisme.module'
import { APP_GUARD } from '@nestjs/core'
import { RoleGuard } from '@/modules/users/providers/guards/role.guard'
import { InstructionTimesModule } from '@/modules/instruction_time/instruction_times.module'
import { CustomBullModule } from '@/shared/modules/custom-bull/custom-bull.module'
import { CronModule } from '@/modules/cron/cron.module'
import { BnConfigurationModule } from '@/shared/modules/bn-configurations/bn-configuration.module'
import siafConfig from '../../config/siaf.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [
        configuration,
        fileConfig,
        dsConfig,
        typeormConfig,
        loggerConfig,
        smtpConfig,
        jwtConfig,
        rnaConfig,
        rnfConfig,
        siafConfig,
        sudoUserConfig,
        instructionTimeMappingConfig,
        redisConfig,
        cronConfig,
        bullConfig,
      ],
    } as ConfigModuleOptions),
    TypeOrmModule.forRootAsync(typeormFactoryLoader),
    CustomBullModule,
    CronModule,
    LoggerModule.forRoot('api'),
    DsApiModule,
    XlsxModule,
    UserModule,
    DemarcheModule,
    DossierModule,
    AuthModule,
    UserModule,
    FileModule,
    HealthModule,
    CustomFilterModule,
    OrganismeModule,
    InstructionTimesModule,
    BnConfigurationModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class ApiModule {}
