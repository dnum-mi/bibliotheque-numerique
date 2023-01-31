import { ApplicationEntity } from "./applicationEntity";

import { Column } from "typeorm";

export enum TypeAuth {
  BEARER_TOKEN = "Bearer",
}

export type TMethod = "GET" | "POST";

export class ConnectorSourceEntity extends ApplicationEntity {
  @Column({ type: "varchar", default: "GET" })
  method: TMethod;

  @Column({
    type: "varchar",
    nullable: false,
  })
  url: string; // https://api.entreprise.data.gouv.fr/v2/etablissements/$params1}?query1={$query1}&query2={$query2}

  @Column({ type: "jsonb" })
  params: string[]; // Params are needed for the url, we store the keys only

  @Column({ type: "jsonb" })
  query: Record<string, string>; // Params are needed for the url, we store the keys and defaultValues

  @Column()
  typeAuth: TypeAuth;

  @Column()
  token: string;
}
