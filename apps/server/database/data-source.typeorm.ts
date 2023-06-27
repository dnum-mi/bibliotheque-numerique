import { DataSource } from "typeorm";
import { options } from "./typeorm.config";

export const dataSource = new DataSource(options);

dataSource
  .initialize()
  .then(() => {
    console.log("====================================================");
    console.log("Datasource initialized successfully");
    console.log("Connected to " + options.database);
    console.log("====================================================\n");
  })
  .catch((e) => {
    console.log("====================================================");
    console.log("Datasource initialization failed");
    console.log(e);
    console.log("====================================================\n");
  });
