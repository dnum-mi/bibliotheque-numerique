import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import configuration from './config/configuration'
import fileConfig from './config/file.config'
import dsConfig from './config/ds.config'
import loggerConfig from './config/logger.config'
import typeormConfig from './config/typeorm-nest.config'
import { DemarcheModule } from './modules/demarches/demarche.module'
import { DossierModule } from './modules/dossiers/dossier.module'
import smtpConfig from './config/smtp.config'
import jwtConfig from './config/jwt.config'
import { RolesModule } from './modules/roles/roles.module'
import { LoggerModule } from './shared/modules/logger/logger.module'
import { UsersModule } from './modules/users/users.module'
import { ConnectorModule } from './modules/connector/connector.module'
import { FilesModule } from './modules/files/files.module'
import { pluginsModules } from './plugins'
import { JobLogModule } from './modules/job-log/job-log.module'
import { typeormFactoryLoader } from './shared/utils/typeorm-factory-loader'
import { HealthModule } from './modules/health/health.module'
import { AuthModule } from './modules/auth/auth.module'
import { DsApiModule } from './shared/modules/ds-api/ds-api.module'
import { CustomFilterModule } from '@/modules/custom-filters/custom-filter.module'
import { XlsxModule } from '@/shared/modules/xlsx/xlsx.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration, fileConfig, dsConfig, typeormConfig, loggerConfig, smtpConfig, jwtConfig],
    }),
    LoggerModule,
    DsApiModule,
    XlsxModule,
    TypeOrmModule.forRootAsync(typeormFactoryLoader),
    DemarcheModule,
    DossierModule,
    AuthModule,
    UsersModule,
    RolesModule,
    ConnectorModule,
    FilesModule,
    HealthModule,
    CustomFilterModule,
    ...pluginsModules,

    // TODO: AppModule use JobModule for now to retrieve JobLogService
    JobLogModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
}
