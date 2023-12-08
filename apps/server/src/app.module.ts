import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import configuration from './config/configuration'
import fileConfig from './config/file.config'
import dsConfig from './config/ds.config'
import loggerConfig from './config/logger.config'
import typeormConfig from './config/typeorm-nest.config'
import smtpConfig from './config/smtp.config'
import jwtConfig from './config/jwt.config'
import rnaConfig from './config/rna.config'
import rnfConfig from './config/rnf.config'
import excelImportConfig from './config/excel-import.config'
import sudoUserConfig from '@/config/sudo-user.config'

import { DemarcheModule } from './modules/demarches/demarche.module'
import { DossierModule } from './modules/dossiers/dossier.module'
import { LoggerModule } from './shared/modules/logger/logger.module'
import { UserModule } from './modules/users/user.module'
import { FileModule } from './modules/files/file.module'
import { pluginsModules } from './plugins'
import { typeormFactoryLoader } from './shared/utils/typeorm-factory-loader'
import { HealthModule } from './modules/health/health.module'
import { AuthModule } from './modules/auth/auth.module'
import { DsApiModule } from './shared/modules/ds-api/ds-api.module'
import { CustomFilterModule } from '@/modules/custom-filters/custom-filter.module'
import { XlsxModule } from '@/shared/modules/xlsx/xlsx.module'
import { OrganismeModule } from '@/modules/organismes/organisme.module'
import { APP_GUARD } from '@nestjs/core'
import { RoleGuard } from '@/modules/users/providers/guards/role.guard'

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
        excelImportConfig,
        sudoUserConfig,
      ],
    }),
    LoggerModule.forRoot('api'),
    DsApiModule,
    XlsxModule,
    TypeOrmModule.forRootAsync(typeormFactoryLoader),
    UserModule,
    DemarcheModule,
    DossierModule,
    AuthModule,
    UserModule,
    FileModule,
    HealthModule,
    CustomFilterModule,
    OrganismeModule,
    ...pluginsModules,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}
