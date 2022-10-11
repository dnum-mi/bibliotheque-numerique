import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DemarcheModule } from "./demarche/demarche.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "user",
      password: "password",
      database: "biblio-num",
      entities: [],
      synchronize: true,
    }),
    DemarcheModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
