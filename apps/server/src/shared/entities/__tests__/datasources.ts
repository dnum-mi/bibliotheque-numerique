import { DataSource } from "typeorm";

// TODO: fixe type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const datasourceTest = (entities) =>
  new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "user",
    password: "password",
    database: "biblio-num-test",
    logging: false,
    synchronize: true,
    name: "default",
    migrationsTableName: "migrations",
    entities,
    // migrations: [__dirname + "/migrations/*.ts"],
  });
