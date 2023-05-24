import * as dotenv from "dotenv";
dotenv.config();

import { DataSource } from "typeorm";

// Load Database Entities
import { pluginsEntities } from "../plugins";
import { resolve } from "path";
import { Demarche } from "../modules/demarches/entities/demarche.entity";
import { DemarcheDS } from "../modules/demarches/entities/demarche_ds.entity";
import { Dossier } from "../modules/dossiers/entities/dossier.entity";
import { DossierDS } from "../modules/dossiers/entities/dossier_ds.entity";
import { User } from "../modules/users/entities/user.entity";
import { Role } from "../modules/roles/entities/role.entity";
import { Connector } from "../modules/connector/connector.entity";
import { FileStorage } from "../modules/files/file_storage.entity";

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
    Connector,
    FileStorage,
    JobLog,
    ...pluginsEntities,
  ],
  //TODO entities: ["../entities/**.entity.ts"],
  //TODO subscribers: ["subscriber/*.ts"],
  migrations: [
    resolve(__dirname, "./migrations/*.{ts,js}"),
    resolve(__dirname, "../plugins/**/db/migrations/*.{ts,js}"),
  ],
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });
