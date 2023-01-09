import * as dotenv from "dotenv";
dotenv.config();

import { DataSource } from "typeorm";

// Load Database Entities
import {
  DemarcheDS,
  Demarche,
  DossierDS,
  Dossier,
  User,
  Role,
} from "../entities";
import { pluginsEntities } from "../plugins";
import { resolve } from "path";

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
  entities: [
    Demarche,
    DemarcheDS,
    Dossier,
    DossierDS,
    User,
    Role,
    ...pluginsEntities,
  ],
  //TODO entities: ["../entities/**.entity.ts"],
  //TODO subscribers: ["subscriber/*.ts"],
  migrations: [
    resolve(__dirname, "./migrations/*.ts"),
    resolve(__dirname, "../plugins/**/db/migrations/*.ts"),
  ],
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });
