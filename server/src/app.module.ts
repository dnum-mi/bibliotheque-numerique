import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DemarchesModule } from "./demarches/demarches.module";

const host = process.env.POSTGRES_HOST || "localhost";
const port = Number(process.env.POSTGRES_PORT) || 5432;
const username = process.env.POSTGRES_USERNAME || "user";
const password = process.env.POSTGRES_PASSWORD || "password";
const database = process.env.POSTGRES_DB || "biblio-num";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host,
      port,
      username,
      password,
      database,
      entities: [],
      synchronize: true,
    }),
    DemarchesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
