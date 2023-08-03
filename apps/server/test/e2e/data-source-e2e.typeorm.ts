import { DataSource } from "typeorm";
import { options } from "../../database/typeorm.config";
import { DataSourceOptions } from "typeorm/data-source/DataSourceOptions";

// this is not use by the code. But only for fixtures
export const dataSource = new DataSource({
  ...options(),
  database: "biblio-num-e2e",
} as DataSourceOptions);

dataSource.initialize().catch((e) => {
  console.log("====================================================");
  console.log("Datasource initialization failed");
  console.log(e);
  console.log("====================================================\n");
});
