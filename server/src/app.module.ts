import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

// Load Configurations
import configuration from "./config/configuration";
import { AppDataSource } from "./db/app-data-source";

// Load Modules
import { DemarchesModule } from "./demarches/demarches.module";
import { DemarchesDSModule } from "./demarches_ds/demarches_ds.module";
import { DossiersModule } from "./dossiers/dossiers.module";
import { DossiersDSModule } from "./dossiers_ds/dossiers_ds.module";
import { RolesModule } from "./roles/roles.module";
import { LoggerModule } from "./logger/logger.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { pluginsModules } from "./plugins";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
    }),
    LoggerModule,
    TypeOrmModule.forRoot(AppDataSource.options),
    DemarchesModule,
    DemarchesDSModule,
    DossiersModule,
    DossiersDSModule,
    AuthModule,
    UsersModule,
    RolesModule,
    ...pluginsModules,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
