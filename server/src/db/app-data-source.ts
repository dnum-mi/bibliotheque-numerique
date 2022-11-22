import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
dotenv.config();

// Load Database Entities
import { DemarcheDS, Demarche, DossierDS, Dossier } from "../entities";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USERNAME || "user",
  password: process.env.POSTGRES_PASSWORD || "password",
  database: process.env.POSTGRES_DB || "biblio-num",
  logging: false,
  synchronize: false,
  name: "default",
  migrationsTableName: "migrations",
  entities: [Demarche, DemarcheDS, Dossier, DossierDS],
  //TODO entities: ["../entities/**.entity.ts"],
  //TODO subscribers: ["subscriber/*.ts"],
  migrations: [__dirname + "/migrations/*.ts"],
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });
