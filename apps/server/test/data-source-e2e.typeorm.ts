import { DataSource } from "typeorm";
import { options } from "../database/typeorm.config";
import { DataSourceOptions } from "typeorm/data-source/DataSourceOptions";

export const dataSource = new DataSource({
  ...options(),
  database: "biblio-num-e2e",
} as DataSourceOptions);

dataSource
  .initialize()
  .then(() => {
    console.log("====================================================");
    console.log("Datasource initialized successfully");
    console.log("Connected to " + dataSource.options.database);
    console.log("====================================================\n");
  })
  .catch((e) => {
    console.log("====================================================");
    console.log("Datasource initialization failed");
    console.log(e);
    console.log("====================================================\n");
  });
